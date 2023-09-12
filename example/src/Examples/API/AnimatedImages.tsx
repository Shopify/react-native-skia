import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Canvas,
  useAnimatedImage,
  AnimatedImage,
} from "@shopify/react-native-skia";

export const AnimatedImages = () => {
  const exampleGif = useAnimatedImage(bse64Gif);

  // TODO - fix this, exampleGif is always null on Android currently
  console.log(exampleGif);

  const { width: wWidth } = useWindowDimensions();
  const SIZE = wWidth / 3;
  const S2 = 60;
  const PAD = (SIZE - S2) / 2;

  return (
    <ScrollView>
      <Canvas
        style={{
          alignSelf: "center",
          width: 320,
          height: 180,
          marginVertical: PAD,
        }}
      >
        <AnimatedImage
          image={exampleGif}
          x={0}
          y={0}
          width={320}
          height={180}
          fit="contain"
        />
      </Canvas>
    </ScrollView>
  );
};

const bse64Gif =
  "data:image/gif;base64,R0lGODlhyADIAPIFAP%2FyAAoKCgAAAcRiAO0cJAAAAAAAAAAAACH%2FC05FVFNDQVBFMi4wAwEAAAAh%2BQQJCgAFACwAAAAAyADIAAAD%2F1i63P4wykmrvTjrzbv%2FYCiOZGmeaKqubOu%2BcCzPdG3feK7vfO%2F%2FwKBwSCwaj8ikcslsOp%2FQqHRKrVqv2Kx2y%2B16v%2BCweEwum8%2FotHrNbrvf8Lh8Tq%2Fb7%2Fi8fs%2Fv%2B%2F%2BAgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq%2BwsbKztLW2t7i5uru8vb6%2FwMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t%2Fg4eLj5OXmkwLpAszq68vt7OrI7QH1AfDD9Pb4wvr1%2FMH83ZP3S6C9gemAGdxH0NfCfw17PUTozqG6gwcBkph4EP%2FSRI0jONrzeBEjxIQnRNYjmc7kyYolVAZgKcAlRRDt2gHYybPnzo6PPkbkkFOdz6MAgDoSitJD0XRIfSptxBQm0adRe05lpBMpSAtds2bduiisz68VzIo9SlaRWp5oKbxdy7NtorkA4k7AS9cumKeAA9vMiNXr0L1G6a71%2ByWw45yDGRaNqtcBX8U%2FR555zLlmZIp4Kze4jJmxl86PP4NOfFQ0A9KKTWeReRCzbcNNI8C%2BLRsLbXu3g8M9bJm1cKS9r%2Fyudzy46N22k1tZHqD57efGrdfVbEamVuDazxIvAF249NklI39nHr4n2vLBz%2FtOP3h99fbDc7%2FOjj%2Fzys3%2F9NlkX387vcdff%2FJtgVpL4PVnIFTHqQbHgp6x5%2BB48Nln04QL1kbggwI0J%2BEbFHp4oX4LZLhdZICYiJ9sZg0g4wD2MeJiezAaNyONK860yI3h5QjhTjvW%2BGODL3Knm44zGqmIi6EdmJSSELSz45UzJqgHlFLiJaQAWGKpZR5cDimemU4umU6YV46JR5kh4hYnW1Q%2BYCWbWdZpyEEE9EnAbX7%2B2SOFd4qpZyF8%2BgmoooMSumaYbt6RaJ%2BLUtqoo2xGasekgmIWqH2OPmrof44AqV2RPKEqlqZ9mGqdqgDAGhWrfLjaHKyyIneojUi2h2uTi%2B36iGq3%2FSpjX8KW%2Blmxh8AS2exYyTZCrG3G8rhqtLyqR%2B2zudJJaie2EpgmJ%2BGK65%2BPnpRrLq2HqCsuu3v2aq636IIr77zjbuIugfAiei%2B%2B54LiooA9DuxSvpoYbJKGSBIc8CcKY8SwhVMu3KPADR9ccMYWPyyKXSAf6pq%2Bh4b87X4oflzyyienOB7GLStgcr0oW%2FVEAgAh%2BQQJCgAFACwsAHwAbABMAAAD%2F1i63P4wPkGFvDjrzXO1XSiOJPSVaKpK5%2Bq%2B4RfMQQvfOCPTdu6%2Fu1nvR0QFa5WiUnSkISnL6KbJS0qvrIrTOcR6FVSh9UsuhJ%2Bg29n5PXdXa1pbuxVDcfHZnFK3p2F5AXsCfWgpHx8AiouMimxebmMkiBWNlgCPWJF3JZQUl42ZV5t%2FI54CoIyiUomXbx6VqbKrUa2Wrxi2spe0S7qMuBe%2Fu6pykLG3khzDxI7GYKfRlIVcnqDBDszNxXoL0t901Gja2A3a287d0ODS4n7kysLI6Jai7N%2Fu4%2FPA8Vmf9Lyq8MlHA6BBAOXOHaw2kGCAgwAT7oO4iCEhhw8pbpP4T%2F8jNzQYM3rcxRHVyIrPzISj9vHkolcKNdpbWailS4T9VHa8mU6QN5p9bLqEOdHlzIYsUc7gSXQnz1462TlhmjNmqny57l1cerOpSYNY5d2b2rVq0WZh%2FUktWJaTubPE0qogazSliXkD8g74KIXuSag68OrlG8XvSMA%2Fd%2Brdq9TnEsMeEa%2F7CmAx4cdsFcFz2jgrhcWg9UqG4Xcz5csRPoQOPfpF6bPaRqtevbi1i9ecNZ%2BVXYF2bbtEnBAYToAe8eKNtSKibXuFcOLGoSdX3nt187k0jkcf%2FpF6ddbAfzznjk77dO%2FMwyuBrNHyIvez1PfNfBJ%2B5cG7rudgT9G%2BfVCl%2BuHAH0T%2B4RefOmUskA89BeYVl3xeLIhOg4wd6FiCCki4DYUPIoihhs1wmB%2BEGGZIH08AkljigCj2VOIFLLYYIBYxojjjFTU%2BpeKHJ7YYyo4J5njTjfNx5WNAHr7YgF81NcZkUJ0pCcGTdXxE5RaoScnAlVzS16SLWjrQpZGYQNnTlWFKANWa6pWTZgFsJmminFG9iUGcF27ZZk52Kqgenne5NUICACH5BAUKAAUALDAAfABsAEwAAAP%2FWLrc%2FjA%2BQYW8OOvNc7VdKI4k9JVoqkrn6r7hF8xBC984I9N27r%2B7We9HRAVrlaJSdKQhKcvopslLSq%2BsitM5xHoVVKH1Sy6En6Db2fk9d1drWlu7FUNx8dmcUrenYXkBewJ9aCkfHwCKi4yKbF5uYySIFY2WAI9YkXcllBSXjZlXm38jngKgjKJSiZdvHpWpsqtRrZavGLayl7RLuoy4F7%2B7qnKQsbeSHMPEjsZgp9GUhVyeoMEOzM3FegvS33TUaNrYDdrbzt3Q4NLifuTKwsjolqLs3%2B7j88DxWZ%2F0vKrwyUcDoEEA5c4drDaQYICDABPug7iIISGHDyluk%2FhP%2FyM3NBgzetzFEdXIis%2FMhKP28eSiVwo12ltZqKVLhP1UdryZTpA3mn1suoQ50eXMhixRzuBJdCfPXjrZOWGaM2aqfLnuXVx6s6lJg1jl3ZvatWrRZmH9SS1YlpO5s8TSqiBrNKWJeQPyDvgohe5JqDrw6uUbxe9IwD936t2r1OcSwx4Rr%2FsKYDHhx2wVwXPaOCuFxaD1SobhdzPlyxE%2BhA49%2BkXps9pGq169uLWL15w1n5VdgXZtu0ScEBhOgB7x4o21IqJte4Vw4sahJ1fee3XzuTSORx%2F%2BkXp11sB%2FPOeOTvt078zDK4Gs0fIi97PU9818En7lwbuu52BP0b59UKX64cAfRP7hF586ZSyQDz0F5hWXfF4siE6DjB3oWIIKSLgNhQ8iiKGGzXCYH4QYZkgfTwCSWOKAKPZU4gUsthggFjGiOOMVNT6l4ocnthjKjgnmeNON83HlY0AevtiAXzU1xmRQnSkJwZN1fETlFqhJycCVXNLXpItaOtClkZhA2dOVYUoA1ZrqlZNmAWwmaaKcUb2JQZwXbtlmTnYqqB6ed7k1QgIAOw%3D%3D";
