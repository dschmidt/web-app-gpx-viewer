import { getCurrentInstance } from '@vue/composition-api'

export const useClientService = (): any => {
  return (getCurrentInstance().proxy as any).$clientService
}
