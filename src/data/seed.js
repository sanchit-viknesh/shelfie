export const CATEGORIES = [
  'Dairy & Eggs',
  'Produce',
  'Meat/Protein',
  'Bakery/Grains',
  'Pantry/Snacks',
  'Baby/Kids',
  'Household/Toiletries',
]

const item = (name, category) => ({
  id: crypto.randomUUID(),
  name,
  category,
  quantity: 3,
  thresholds: { yellow: 2, red: 1 },
  lastBought: null,
})

export function seedItems() {
  return [
    item('Milk 2% (Seal)', 'Dairy & Eggs'),
    item('Eggs 18ct', 'Dairy & Eggs'),
    item('Eggs 12ct', 'Dairy & Eggs'),
    item('Paneer', 'Dairy & Eggs'),
    item('GV Oikos yogurt', 'Dairy & Eggs'),
    item('GV organic milk/cream', 'Dairy & Eggs'),

    item('Blueberries', 'Produce'),
    item('Blackberries', 'Produce'),
    item('Strawberries', 'Produce'),
    item('Guava', 'Produce'),
    item('Grapes', 'Produce'),
    item('Mandarins', 'Produce'),
    item('Shredded lettuce', 'Produce'),
    item('Tomato', 'Produce'),
    item('Garlic', 'Produce'),
    item('Ginger', 'Produce'),
    item('Red onion', 'Produce'),
    item('Russet potato', 'Produce'),
    item('Cherries', 'Produce'),

    item('Chicken breast boneless', 'Meat/Protein'),
    item('Organic chicken breast', 'Meat/Protein'),
    item('Premier protein chicken', 'Meat/Protein'),

    item('Chapatti', 'Bakery/Grains'),
    item('Keto bread', 'Bakery/Grains'),
    item('GV quick oats', 'Bakery/Grains'),
    item('Maggi 2-min noodles', 'Bakery/Grains'),

    item('100% cacao', 'Pantry/Snacks'),
    item("Jell-O", 'Pantry/Snacks'),
    item('Dried cranberries', 'Pantry/Snacks'),
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
  ]
}
