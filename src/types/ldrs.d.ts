declare namespace JSX {
  interface IntrinsicElements {
    'l-hourglass': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        size?: string;
        color?: string;
        speed?: string;
        'bg-opacity'?: string;
      },
      HTMLElement
    >;
  }
} 