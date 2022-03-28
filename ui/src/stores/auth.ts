import create from 'zustand';
import * as zustandMiddleware from 'zustand/middleware';

import * as Config from '@config';
import * as Types from '@types';

let store: any = (set: any): Types.AuthStoreType => ({
    user: null,
    setUser: (user: Types.UserType) => set((state: Types.AuthStoreType) => ({ user }))
});

if (process.env.NEXT_PUBLIC_ENV === 'local') store = zustandMiddleware.devtools(store);

store = zustandMiddleware.persist(store, { name: Config.keys.localStorage.user });

const useAuthStore = create<Types.AuthStoreType>(store);

export default useAuthStore;
