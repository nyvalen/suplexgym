import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useRestApi<T>(url: string) {
  const { data: items, refetch: refetchItems } = useQuery({
    queryKey: [url],
    queryFn: () => axios.get<T[]>(url).then((resp) => resp.data),
  });

  // GETBYID
  const getByIdAsync = (id: number) => {
    return useQuery({
      queryKey: [url, id],
      queryFn: () => {
        axios.get<T>(`${url}/${id}`).then((resp) => resp.data);
      },
    });
  };
  // CREATE
  const { mutateAsync: createAsync } = useMutation({
    mutationFn: (itemToCreate: T) =>
      // ... = spread operátor, legtöbbször objektum másolásra használjuk, pl state immutable
      axios.post(url, { ...itemToCreate }).then((resp) => resp.data),
  });
  // UPDATE
  const { mutateAsync: updateAsync } = useMutation({
    mutationFn: (itemToUpdate: T) =>
      axios.put(url, { ...itemToUpdate }).then((resp) => resp.data),
  });
  // DELETE
  const { mutateAsync: deleteAsync } = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`${url}/${id}`).then((resp) => resp.data),
  });
  return {
    items,
    refetchItems,
    getByIdAsync,
    createAsync,
    updateAsync,
    deleteAsync,
  };
}
