import { ObjectSchema } from 'joi';
import FieldError from '../interfaces/field-error.interface';

export async function dtoValidator<T>(schema: ObjectSchema<any>, data: any): Promise<{
  result: T | null, errors: FieldError[] | null
}> {
  try {
    const result = await schema.validateAsync(data, { abortEarly: false });

    return { result, errors: null };
  } catch (err: any) {
    const errors: FieldError[] = [];

    err.details.forEach(({ message, context }: { message: string, context: { key: string } }) => {
      const { key } = context;
      errors.push({ field: key, description: message });
    });

    return { result: null, errors }
  }
}
