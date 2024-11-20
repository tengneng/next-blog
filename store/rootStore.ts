import userStore, { IUserStore } from "./userStore";

export interface IStore {
  user: IUserStore
}

export default function createStore (initialValue: any) {
  return () => {
    return {
      user: { ...userStore(), ...initialValue?.user },
    }
  }
}