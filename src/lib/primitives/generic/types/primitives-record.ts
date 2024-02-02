import { Primitive } from './primitive';

type BasePrimitivesRecord<T> = Record<string | number, T | T[] | Primitive | Primitive[]>;

export interface PrimitivesRecord extends BasePrimitivesRecord<PrimitivesRecord> {}
