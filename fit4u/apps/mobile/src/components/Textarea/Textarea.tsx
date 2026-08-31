import { forwardRef } from "react";
import type { TextInput } from "react-native";

import { Input, type InputProps } from "../Input/Input";

export type TextareaProps = InputProps;

/** Zone de texte multi-lignes — mêmes props/comportement que `Input`. */
export const Textarea = forwardRef<TextInput, TextareaProps>(function Textarea(props, ref) {
  return (
    <Input
      ref={ref}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      style={{ minHeight: 96 }}
      {...props}
    />
  );
});
