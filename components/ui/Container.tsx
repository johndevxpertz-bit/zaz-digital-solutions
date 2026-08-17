type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

export default function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-[var(--zaz-container)] px-6 sm:px-8 lg:px-12 ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
