export const SEED_VERSION = 2

export const CATEGORIES = [
  'Dairy & Eggs',
  'Produce',
  'Meat/Protein',
  'Bakery/Grains',
  'Pantry/Snacks',
  'Baby/Kids',
  'Household/Toiletries',
]

const item = (name, category, quantity = 3, lastBought = null) => ({
  id: crypto.randomUUID(),
  name,
  category,
  quantity,
  thresholds: { yellow: 2, red: 1 },
  lastBought,
})

const TODAY = new Date().toISOString()

export function seedItems() {
  return [
    item('Milk 2% (Seal)', 'Dairy & Eggs', 10, TODAY),
    item('Milk 3.5% (Luna)', 'Dairy & Eggs', 1, TODAY),
    item('Eggs 18ct', 'Dairy & Eggs', 6, TODAY),
    item('Eggs 12ct', 'Dairy & Eggs', 5, TODAY),
    item('Paneer', 'Dairy & Eggs', 8, TODAY),
    item('GV Oikos yogurt', 'Dairy & Eggs', 5, TODAY),
    item('GV organic milk/cream', 'Dairy & Eggs'),
    item('Cheese', 'Dairy & Eggs', 1, TODAY),

    item('Blueberries', 'Produce', 5, TODAY),
    item('Blackberries', 'Produce', 5, TODAY),
    item('Strawberries', 'Produce', 4, TODAY),
    item('Guava', 'Produce', 5, TODAY),
    item('Grapes', 'Produce'),
    item('Mandarins', 'Produce', 4, TODAY),
    item('Shredded lettuce', 'Produce'),
    item('Tomato', 'Produce', 4, TODAY),
    item('Garlic', 'Produce'),
    item('Ginger', 'Produce', 4, TODAY),
    item('Red onion', 'Produce'),
    item('Russet potato', 'Produce'),
    item('Cherries', 'Produce'),
    item('Bananas', 'Produce', 1, TODAY),

    item('Chicken breast boneless', 'Meat/Protein'),
    item('Organic chicken breast', 'Meat/Protein'),
    item('Premier protein chicken', 'Meat/Protein'),
    item('Chicken thighs', 'Meat/Protein', 2, TODAY),

    item('Chapatti', 'Bakery/Grains'),
    item('Keto bread', 'Bakery/Grains', 5, TODAY),
    item('Keto tortillas', 'Bakery/Grains', 4, TODAY),
    item('GV quick oats', 'Bakery/Grains'),
    item('Maggi 2-min noodles', 'Bakery/Grains'),
    item("Dempster's 12 Grain bread", 'Bakery/Grains', 2, TODAY),

    item('100% cacao', 'Pantry/Snacks'),
    item("Jell-O", 'Pantry/Snacks'),
    item('Dried cranberries', 'Pantry/Snacks'),
    item('Diet cranberry juice', 'Pantry/Snacks', 2, TODAY),
    item('Pepitas', 'Pantry/Snacks', 1, TODAY),
    item('Little Hearts biscuits', 'Pantry/Snacks'),
    item('Jim Jam biscuits', 'Pantry/Snacks'),
    item('Milk rusk', 'Pantry/Snacks'),
    item('Instant soup bowl', 'Pantry/Snacks'),
    item('Mustard', 'Pantry/Snacks'),
    item('Monk fruit sweetener', 'Pantry/Snacks'),
    item('Thai chili', 'Pantry/Snacks'),

    item('Huggies diapers', 'Baby/Kids'),
    item('Diaper liners', 'Baby/Kids'),
    item('Baby snack/jam', 'Baby/Kids'),

    item('Dettol 1L', 'Household/Toiletries'),
    item('Feminine hygiene', 'Household/Toiletries'),
    item('Bottled water', 'Household/Toiletries'),
    item('Sponges', 'Household/Toiletries', 2, TODAY),
  ]
}
