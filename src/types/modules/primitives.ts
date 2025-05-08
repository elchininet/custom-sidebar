export type Primitive = string | number | boolean;
export type PrimitiveObject = {
    [key: string]: Primitive | PrimitiveObject | PrimitiveArray;
};
export type PrimitiveArray = (Primitive | PrimitiveObject | PrimitiveArray)[];