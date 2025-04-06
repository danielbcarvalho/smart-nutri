import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfterStartDate', async: false })
export class IsAfterStartDateConstraint
  implements ValidatorConstraintInterface
{
  validate(endDate: Date, args: ValidationArguments) {
    const startDate = (args.object as any).startDate;
    if (!startDate || !endDate) return true;
    return endDate.getTime() >= startDate.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    return 'A data final não pode ser anterior à data inicial';
  }
}

export function IsAfterStartDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfterStartDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsAfterStartDateConstraint,
    });
  };
}
