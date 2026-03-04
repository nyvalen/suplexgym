export interface NewsDTO {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  imagePath: string;
}

export interface TicketsDTO {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  price: number;
}
