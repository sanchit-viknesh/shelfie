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
    item('Milk 2% (Seal)', 'Dairy & Eggs', 6, TODAY),
    item('Milk 3.5% (Luna)', 'Dairy & Eggs', 1, TODAY),
    item('Eggs 18ct', 'Dairy & Eggs', 5, TODAY),
    item('Eggs 12ct', 'Dairy & Eggs', 4, TODAY),
    item('Paneer', 'Dairy & Eggs', 6, TODAY),
    item('GV Oikos yogurt', 'Dairy & Eggs'),
    item('GV organic milk/cream', 'Dairy & Eggs'),

    item('Blueberries', 'Produce', 4, TODAY),
    item('Blackberries', 'Produce', 5, TODAY),
    item('Strawberries', 'Produce'),
    item('Guava', 'Produce', 4, TODAY),
    item('Grapes', 'Produce'),
    item('Mandarins', 'Produce'),
    item('Shredded lettuce', 'Produce'),
    item('Tomato', 'Produce'),
    item('Garlic', 'Produce'),
    item('Ginger', 'Produce', 4, TODAY),
    item('Red onion', 'Produce'),
    item('Russet potato', 'Produce'),
    item('Cherries', 'Produce'),
    item('Bananas', 'Produce', 1, TODAY),

    item('Chicken breast boneless', 'Meat/Protein'),
    item('Organic chicken breast', 'Meat/Protein'),
    item('Premier protein chicken', 'Meat/Protein'),
    item('Chicken thighs', 'Meat/Protein', 1, TODAY),

    item('Chapatti', 'Bakery/Grains'),
    item('Keto bread', 'Bakery/Grains'),
    item('Keto tortillas', 'Bakery/Grains', 4, TODAY),
    item('GV quick oats', 'Bakery/Grains'),
    item('Maggi 2-min noodles', 'Bakery/Grains'),

    item('100% cacao', 'Pantry/Snacks'),
    item("Jell-O", 'Pantry/Snacks'),
    item('Dried cranberries', 'Pantry/Snacks'),
    item('Diet cranberry juice', 'Pantry/Snacks', 1, TODAY),
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
