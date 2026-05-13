export interface CreateCustomSupplyRequest {
  supplyId: number;
  description: string;
  minStock: number;
  maxStock: number;
  price: number;
  userId: number;
  unitName: string;
  unitAbbreviaton: string; // typo intencional: así lo espera el backend
}

export interface CustomSupply {
  id: number;
  supply: {
    id: number;
    name: string;
    description: string;
    perishable: boolean;
    category: string;
  };
  description: string;
  minStock: number;
  maxStock: number;
  price: number;
  unitName: string;
  unitAbbreviaton: string; // typo intencional
  currencyCode: string;
  userId: number;
}

