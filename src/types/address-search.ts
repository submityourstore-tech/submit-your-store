export type AddressSuggestion = {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  lat: number;
  lon: number;
};

export type AddressSelection = AddressSuggestion;
