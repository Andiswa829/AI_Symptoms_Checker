import * as React from 'react';
import { Slot } from '@radix-ui/react-slot'; // or wherever Slot is imported from
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '../../utils/buttonVariants';
import { cn } from './utils';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };