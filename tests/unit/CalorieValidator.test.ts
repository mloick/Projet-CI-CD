import { CalorieValidator } from '../../src/services/CalorieValidator';

describe('CalorieValidator', () => {
  describe('validate', () => {
    it('should not throw for a valid target above 1200', () => {
      expect(() => CalorieValidator.validate(1500, 2000)).not.toThrow();
    });

    it('should not throw when target equals exactly 1200', () => {
      expect(() => CalorieValidator.validate(1200, 2000)).not.toThrow();
    });

    it('should throw when target calories are below 1200', () => {
      expect(() => CalorieValidator.validate(1199, 2000)).toThrow(
        'Target calories (1199) cannot be below 1200'
      );
    });

    it('should throw with the actual value in the message', () => {
      expect(() => CalorieValidator.validate(900, 2000)).toThrow('(900)');
    });

    it('should not throw when surplus is below 500 kcal', () => {
      // 2400 - 2000 = 400 < 500 → no warning
      expect(() => CalorieValidator.validate(2400, 2000)).not.toThrow();
    });

    it('should not throw (only warn) when surplus exceeds 500 kcal', () => {
      // 2600 - 2000 = 600 > 500 → logs a warning but does not throw
      expect(() => CalorieValidator.validate(2600, 2000)).not.toThrow();
    });
  });
});
