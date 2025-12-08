import { Schema } from 'mongoose';

export function SoftDeletePlugin(schema: Schema) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  function excludeDeleted(this: any, next: Function) {
    if (!this.getFilter().includeDeleted) {
      this.where({ deletedAt: null });
    } else {
      delete this.getFilter().includeDeleted;
    }
    next();
  }

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);

  const originalPopulate = schema.methods.populate;
  schema.methods.populate = function (...args: any[]) {
    const populateOptions = Array.isArray(args[0]) ? args[0] : [args[0]];

    populateOptions.forEach((p) => {
      if (!p.match) p.match = {};
      if (!p.options?.includeDeleted) {
        p.match.deletedAt = null;
      }
    });

    return originalPopulate.apply(this, args);
  };
}
