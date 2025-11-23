import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white',
        outline: 'border border-gray-300 text-gray-700',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
        link: 'text-primary underline-offset-4 hover:underline',
        secondary: 'bg-secondary text-secondary-foreground',
      },
      size: {
        sm: 'h-8 px-3',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);