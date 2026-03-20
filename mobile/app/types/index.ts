export interface NewsDTO {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  imagePath: string;
  createdat: Date;
}

export interface TicketsDTO {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  price: number;
}

export interface UsersDTO {
  id: number;
  name: string;
  username: string;
}

export interface ItemDTO {
  id: number;
  Name: string;
  Description: string;
  Price: number;
  ImagePath: string;
  Type_id: number;
}
