import samosaImg from '@/assets/food/samosa.jpg';
import vadaPavImg from '@/assets/food/vada-pav.jpg';
import burgerImg from '@/assets/food/burger.jpg';
import friesImg from '@/assets/food/fries.jpg';
import noodlesImg from '@/assets/food/noodles.jpg';
import coldCoffeeImg from '@/assets/food/cold-coffee.jpg';

export type BuiltInMenuImageOption = {
  label: string;
  src: string;
};

export const builtInMenuImages: BuiltInMenuImageOption[] = [
  { label: 'Samosa', src: samosaImg },
  { label: 'Vada Pav', src: vadaPavImg },
  { label: 'Burger', src: burgerImg },
  { label: 'Fries', src: friesImg },
  { label: 'Noodles', src: noodlesImg },
  { label: 'Cold Coffee', src: coldCoffeeImg },
];
