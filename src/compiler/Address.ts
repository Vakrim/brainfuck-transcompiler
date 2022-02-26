const addressBrand = Symbol('addressBrand');

export type Address = number & { __brand: typeof addressBrand };
