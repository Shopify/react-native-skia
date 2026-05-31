import { surface, itRunsWithGraphite } from "../setup";

// Ported from react-native-webgpu (ComputeShader.spec.ts). Runs a matrix
// multiplication on a compute pipeline and checks the GPU result against a JS
// reference. WebGPU is only available on Graphite (Dawn) builds.
const multiplyMatrices = (m1: number[], m2: number[]) => {
  const rows1 = m1[0],
    cols1 = m1[1];
  const cols2 = m2[1];
  const result: number[] = new Array(2 + rows1 * cols2);
  result[0] = rows1;
  result[1] = cols2;

  for (let i = 0; i < rows1; i++) {
    for (let j = 0; j < cols2; j++) {
      let sum = 0;
      for (let k = 0; k < cols1; k++) {
        sum += m1[2 + i * cols1 + k] * m2[2 + k * cols2 + j];
      }
      result[2 + i * cols2 + j] = sum;
    }
  }
  return result;
};

const makeMatrix = (rows: number, columns: number) => {
  const m: number[] = new Array(rows * columns + 2);
  m[0] = rows;
  m[1] = columns;
  for (let i = 2; i < m.length; i++) {
    m[i] = Math.random();
  }
  return m;
};

const SHADER = `
struct Matrix {
  size : vec2<f32>,
  numbers: array<f32>,
}

@group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
@group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
@group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  // Guard against out-of-bounds work group sizes
  if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
    return;
  }

  resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

  let resultCell = vec2(global_id.x, global_id.y);
  var result = 0.0;
  for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
    let a = i + resultCell.x * u32(firstMatrix.size.y);
    let b = resultCell.y + i * u32(secondMatrix.size.y);
    result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
  }

  let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
  resultMatrix.numbers[index] = result;
}
`;

describe("Compute Shader", () => {
  itRunsWithGraphite("matrix multiplication", async () => {
    const rows = 16;
    const columns = 16;
    const m1 = makeMatrix(rows, columns);
    const m2 = makeMatrix(rows, columns);

    const result = await surface.eval(
      (Skia, { firstMatrixRaw, secondMatrixRaw, rows1, columns1, shader }) => {
        const device = Skia.getDevice();
        const firstMatrix = new Float32Array(firstMatrixRaw);
        const secondMatrix = new Float32Array(secondMatrixRaw);
        const gpuBufferFirstMatrix = device.createBuffer({
          mappedAtCreation: true,
          size: firstMatrix.byteLength,
          usage: GPUBufferUsage.STORAGE,
        });
        new Float32Array(gpuBufferFirstMatrix.getMappedRange()).set(
          firstMatrix
        );
        gpuBufferFirstMatrix.unmap();

        const gpuBufferSecondMatrix = device.createBuffer({
          mappedAtCreation: true,
          size: secondMatrix.byteLength,
          usage: GPUBufferUsage.STORAGE,
        });
        new Float32Array(gpuBufferSecondMatrix.getMappedRange()).set(
          secondMatrix
        );
        gpuBufferSecondMatrix.unmap();

        const resultMatrixBufferSize =
          Float32Array.BYTES_PER_ELEMENT *
          (2 + firstMatrix[0] * secondMatrix[1]);
        const resultMatrixBuffer = device.createBuffer({
          size: resultMatrixBufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        const shaderModule = device.createShaderModule({ code: shader });
        const computePipeline = device.createComputePipeline({
          layout: "auto",
          compute: { module: shaderModule, entryPoint: "main" },
        });

        const bindGroup = device.createBindGroup({
          layout: computePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: gpuBufferFirstMatrix } },
            { binding: 1, resource: { buffer: gpuBufferSecondMatrix } },
            { binding: 2, resource: { buffer: resultMatrixBuffer } },
          ],
        });

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(
          Math.ceil(rows1 / 8),
          Math.ceil(columns1 / 8)
        );
        passEncoder.end();

        const gpuReadBuffer = device.createBuffer({
          size: resultMatrixBufferSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        commandEncoder.copyBufferToBuffer(
          resultMatrixBuffer,
          0,
          gpuReadBuffer,
          0,
          resultMatrixBufferSize
        );
        device.queue.submit([commandEncoder.finish()]);

        return gpuReadBuffer.mapAsync(GPUMapMode.READ).then(() => {
          const r = Array.from(
            new Float32Array(gpuReadBuffer.getMappedRange())
          );
          gpuReadBuffer.unmap();
          return r;
        });
      },
      {
        firstMatrixRaw: m1,
        secondMatrixRaw: m2,
        rows1: rows,
        columns1: columns,
        shader: SHADER,
      }
    );

    expect(result.length).toBe(16 * 16 + 2);
    expect(result.some((x) => x !== 0)).toBe(true);
    const reference = multiplyMatrices(m1, m2);
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(reference[i], 5);
    }
  });

  itRunsWithGraphite("async matrix multiplication", async () => {
    const rows = 16;
    const columns = 16;
    const m1 = makeMatrix(rows, columns);
    const m2 = makeMatrix(rows, columns);

    const result = await surface.eval(
      (Skia, { firstMatrixRaw, secondMatrixRaw, rows1, columns1, shader }) => {
        const device = Skia.getDevice();
        const firstMatrix = new Float32Array(firstMatrixRaw);
        const secondMatrix = new Float32Array(secondMatrixRaw);
        const gpuBufferFirstMatrix = device.createBuffer({
          mappedAtCreation: true,
          size: firstMatrix.byteLength,
          usage: GPUBufferUsage.STORAGE,
        });
        new Float32Array(gpuBufferFirstMatrix.getMappedRange()).set(
          firstMatrix
        );
        gpuBufferFirstMatrix.unmap();

        const gpuBufferSecondMatrix = device.createBuffer({
          mappedAtCreation: true,
          size: secondMatrix.byteLength,
          usage: GPUBufferUsage.STORAGE,
        });
        new Float32Array(gpuBufferSecondMatrix.getMappedRange()).set(
          secondMatrix
        );
        gpuBufferSecondMatrix.unmap();

        const resultMatrixBufferSize =
          Float32Array.BYTES_PER_ELEMENT *
          (2 + firstMatrix[0] * secondMatrix[1]);
        const resultMatrixBuffer = device.createBuffer({
          size: resultMatrixBufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        const shaderModule = device.createShaderModule({ code: shader });
        return device
          .createComputePipelineAsync({
            layout: "auto",
            compute: { module: shaderModule, entryPoint: "main" },
          })
          .then((computePipeline) => {
            const bindGroup = device.createBindGroup({
              layout: computePipeline.getBindGroupLayout(0),
              entries: [
                { binding: 0, resource: { buffer: gpuBufferFirstMatrix } },
                { binding: 1, resource: { buffer: gpuBufferSecondMatrix } },
                { binding: 2, resource: { buffer: resultMatrixBuffer } },
              ],
            });

            const commandEncoder = device.createCommandEncoder();
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(computePipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.dispatchWorkgroups(
              Math.ceil(rows1 / 8),
              Math.ceil(columns1 / 8)
            );
            passEncoder.end();

            const gpuReadBuffer = device.createBuffer({
              size: resultMatrixBufferSize,
              usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });
            commandEncoder.copyBufferToBuffer(
              resultMatrixBuffer,
              0,
              gpuReadBuffer,
              0,
              resultMatrixBufferSize
            );
            device.queue.submit([commandEncoder.finish()]);

            return gpuReadBuffer.mapAsync(GPUMapMode.READ).then(() => {
              const r = Array.from(
                new Float32Array(gpuReadBuffer.getMappedRange())
              );
              gpuReadBuffer.unmap();
              return r;
            });
          });
      },
      {
        firstMatrixRaw: m1,
        secondMatrixRaw: m2,
        rows1: rows,
        columns1: columns,
        shader: SHADER,
      }
    );

    expect(result.length).toBe(16 * 16 + 2);
    expect(result.some((x) => x !== 0)).toBe(true);
    const reference = multiplyMatrices(m1, m2);
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toBeCloseTo(reference[i], 5);
    }
  });
});
