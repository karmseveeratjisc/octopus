import create from 'zustand';
import * as zustandMiddleware from 'zustand/middleware';

import * as Config from '@config';
import * as Types from '@types';

type State = {
    darkMode: boolean;
};

let store: any = (set: any): Types.PreferencesStoreTypes => ({
    darkMode: false,
    toggle: () => set((state: State) => ({ darkMode: !state.darkMode }))
});

if (process.env.NEXT_PUBLIC_ENV === 'local') store = zustandMiddleware.devtools(store);

store = zustandMiddleware.persist(store, { name: Config.keys.localStorage.darkMode });

const usePreferencesStore = create(store);

export default usePreferencesStore;
