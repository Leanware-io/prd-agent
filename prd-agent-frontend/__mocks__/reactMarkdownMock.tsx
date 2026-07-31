import { ReactNode } from "react";

interface ChildrenProps {
  children: ReactNode;
}

function ReactMarkdownMock({ children }: Readonly<ChildrenProps>) {
  return <p>{children}</p>;
}

export default ReactMarkdownMock;
