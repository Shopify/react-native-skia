import React from 'react';

interface ExampleProps {
  children: string;
}

export const Example = ({ children }: ExampleProps) => {
  console.log({ children });
  return (
    <div>{children}</div>
  );
}
