"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createHouseholdUser as createHouseholdUserRequest,
  listHouseholdUsers,
  removeHouseholdUser as removeHouseholdUserRequest,
  resetHouseholdUserPassword as resetHouseholdUserPasswordRequest,
  updateHouseholdUser as updateHouseholdUserRequest,
} from "@/lib/admin-api";
import { currentMonthKey } from "@/lib/format";
import { clearHouseholdCache } from "@/lib/household";
import {
  persistFinishMarket,
  persistMarketItem,
  persistMarketStore,
  persistProduct,
  persistProductDelete,
  persistProductUpdate,
  persistSelected,
  persistStartMarket,
  persistStore,
  persistStoreDelete,
  persistStoreUpdate,
  persistUserName,
} from "@/lib/mutations";
import { getSupabase } from "@/lib/supabase/client";
import { loadHouseholdState } from "@/lib/queries";
import { deriveMonthSnapshots, monthSummaryFromHistory } from "@/lib/summary";
import type {
  ActiveMarket,
  HistoryMarket,
  HouseholdUser,
  MarketItem,
  Product,
  ProductDraft,
  Store,
} from "@/lib/types";

type Toast = { message: string } | null;

type AppContextValue = {
  products: Product[];
  selectedIds: string[];
  stores: Store[];
  userName: string;
  market: ActiveMarket | null;
  history: HistoryMarket[];
  month: string;
  currentMonth: string;
  monthlyBudget: number;
  toast: Toast;
  notificationsOpen: boolean;
  currentUserId: string;
  isAdmin: boolean;
  householdUsers: HouseholdUser[];
  setMonth: (month: string) => void;
  setNotificationsOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  toggleSelected: (id: string) => void;
  addProduct: (draft: ProductDraft) => Promise<string>;
  updateProduct: (id: string, draft: Partial<ProductDraft> & { frequencyDays?: number }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  addStore: (name: string) => Promise<Store | null>;
  updateStore: (id: string, name: string) => Promise<Store | null>;
  deleteStore: (id: string) => Promise<void>;
  startMarket: (
    items: Array<Pick<MarketItem, "productId" | "quantity">>,
    store: string,
  ) => Promise<boolean>;
  updateMarketStore: (store: string) => void;
  updateMarketQuantity: (productId: string, quantity: number) => void;
  updateMarketPrice: (productId: string, unitPrice: number) => void;
  markPurchased: (productId: string) => void;
  returnToPending: (productId: string) => void;
  finishMarket: () => Promise<boolean>;
  getProduct: (id: string) => Product | undefined;
  createHouseholdUser: (input: {
    email: string;
    password: string;
    displayName: string;
  }) => Promise<boolean>;
  updateHouseholdUser: (input: {
    userId: string;
    email?: string;
    displayName?: string;
  }) => Promise<boolean>;
  resetHouseholdUserPassword: (userId: string, password: string) => Promise<boolean>;
  removeHouseholdUser: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function isUniqueViolation(error: unknown) {
  return error instanceof Error && /stores_household_name_uidx|duplicate key/i.test(error.message);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [userName, setUserNameState] = useState("Usuario");
  const [market, setMarket] = useState<ActiveMarket | null>(null);
  const [history, setHistory] = useState<HistoryMarket[]>([]);
  const [month, setMonth] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(950_000);
  const [toast, setToast] = useState<Toast>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [householdUsers, setHouseholdUsers] = useState<HouseholdUser[]>([]);

  const showToast = (message: string) => {
    setToast({ message });
    window.setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const state = await loadHouseholdState();
        if (cancelled || !state) return;
        const nowMonth = currentMonthKey();
        setCurrentMonth(nowMonth);
        setMonth(nowMonth);
        setUserNameState(state.userName);
        setMonthlyBudget(state.monthlyBudget);
        setStores(state.stores);
        setProducts(state.products);
        setSelectedIds(state.selectedIds);
        setMarket(state.market);
        setHistory(state.history);
        setCurrentUserId(state.currentUserId);
        setIsAdmin(state.isAdmin);
        if (state.isAdmin) {
          try {
            setHouseholdUsers(await listHouseholdUsers());
          } catch (adminError) {
            showToast(
              adminError instanceof Error ? adminError.message : "No se pudieron cargar los usuarios",
            );
          }
        }
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "No se pudo conectar a la base de datos";
        if (/autorizado|not allowed|Inicia sesión/i.test(message)) {
          clearHouseholdCache();
          await getSupabase().auth.signOut();
          window.location.assign("/ingresar");
          return;
        }
        showToast(message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      products,
      selectedIds,
      stores,
      userName,
      market,
      history,
      month,
      currentMonth,
      monthlyBudget,
      toast,
      notificationsOpen,
      currentUserId,
      isAdmin,
      householdUsers,
      setMonth,
      setNotificationsOpen,
      showToast,
      toggleSelected(id) {
        const next = !selectedIds.includes(id);
        setSelectedIds((current) =>
          next ? [...current, id] : current.filter((item) => item !== id),
        );
        void persistSelected(id, next).catch((error: unknown) => {
          setSelectedIds((current) =>
            next ? current.filter((item) => item !== id) : [...current, id],
          );
          showToast(error instanceof Error ? error.message : "No se pudo actualizar la selección");
        });
      },
      async addProduct(draft) {
        try {
          const product = await persistProduct(draft);
          setProducts((current) => [product, ...current]);
          showToast("Producto agregado a tu lista habitual");
          return product.id;
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo agregar el producto");
          return "";
        }
      },
      async updateProduct(id, draft) {
        try {
          await persistProductUpdate(id, draft);
          setProducts((current) =>
            current.map((product) => (product.id === id ? { ...product, ...draft } : product)),
          );
          showToast("Producto actualizado");
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo actualizar el producto");
        }
      },
      async deleteProduct(id) {
        try {
          await persistProductDelete(id);
          setProducts((current) => current.filter((product) => product.id !== id));
          setSelectedIds((current) => current.filter((item) => item !== id));
          setMarket((current) =>
            current
              ? { ...current, items: current.items.filter((item) => item.productId !== id) }
              : current,
          );
          showToast("Producto eliminado de la lista habitual");
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo eliminar el producto");
        }
      },
      async setUserName(name) {
        const trimmed = name.trim();
        if (!trimmed) {
          showToast("Escribe un nombre para mostrarlo en la app.");
          return;
        }
        try {
          await persistUserName(trimmed);
          setUserNameState(trimmed);
          showToast("Nombre actualizado");
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo guardar el nombre");
        }
      },
      async addStore(name) {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const existing = stores.find((store) => store.name.toLowerCase() === trimmed.toLowerCase());
        if (existing) {
          showToast("Ese lugar ya está en tu lista");
          return existing;
        }
        try {
          const store = await persistStore(trimmed);
          setStores((current) => [...current, store].toSorted((a, b) => a.name.localeCompare(b.name, "es")));
          showToast("Lugar agregado");
          return store;
        } catch (error) {
          showToast(
            isUniqueViolation(error)
              ? "Ese lugar ya está en tu lista"
              : error instanceof Error
                ? error.message
                : "No se pudo agregar el lugar",
          );
          return null;
        }
      },
      async updateStore(id, name) {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const clash = stores.find(
          (store) => store.id !== id && store.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (clash) {
          showToast("Ese lugar ya está en tu lista");
          return clash;
        }
        try {
          await persistStoreUpdate(id, trimmed);
          const previous = stores.find((store) => store.id === id);
          setStores((current) =>
            current.map((store) => (store.id === id ? { ...store, name: trimmed } : store)),
          );
          if (previous && market?.store === previous.name) {
            setMarket((current) => (current ? { ...current, store: trimmed } : current));
          }
          showToast("Lugar actualizado");
          return { id, name: trimmed };
        } catch (error) {
          showToast(
            isUniqueViolation(error)
              ? "Ese lugar ya está en tu lista"
              : error instanceof Error
                ? error.message
                : "No se pudo actualizar el lugar",
          );
          return null;
        }
      },
      async deleteStore(id) {
        const previous = stores.find((store) => store.id === id);
        try {
          await persistStoreDelete(id);
          setStores((current) => current.filter((store) => store.id !== id));
          if (previous && market?.store === previous.name && market) {
            setMarket({ ...market, store: "" });
            void persistMarketStore(market.id, null, "");
          }
          showToast("Lugar eliminado");
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo eliminar el lugar");
        }
      },
      async startMarket(items, store) {
        const place = store.trim();
        if (!place) {
          showToast("Indica el lugar donde vas a realizar esta compra.");
          return false;
        }
        try {
          let placeRow = stores.find((entry) => entry.name.toLowerCase() === place.toLowerCase());
          if (!placeRow) {
            placeRow = await persistStore(place);
            setStores((current) => [...current, placeRow!]);
          }
          const productById = new Map(products.map((product) => [product.id, product]));
          const started = await persistStartMarket(
            items.map((item) => {
              const product = productById.get(item.productId);
              return {
                productId: item.productId,
                quantity: item.quantity,
                name: product?.name ?? "Producto",
                unit: product?.unit ?? "unidades",
                unitPrice: product?.lastPrice ?? 0,
              };
            }),
            placeRow,
            market?.id,
          );
          setMarket({
            id: started.id,
            store: placeRow.name,
            date: started.date,
            status: "active",
            items: started.items,
          });
          showToast("Mercado iniciado. Los productos siguen en tu lista habitual.");
          return true;
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo iniciar el mercado");
          return false;
        }
      },
      updateMarketStore(store) {
        const place = store.trim();
        const placeRow = stores.find((entry) => entry.name.toLowerCase() === place.toLowerCase());
        setMarket((current) => (current ? { ...current, store: place } : current));
        if (market) {
          void persistMarketStore(market.id, placeRow?.id ?? null, place).catch((error: unknown) => {
            showToast(error instanceof Error ? error.message : "No se pudo guardar el lugar");
          });
        }
      },
      updateMarketQuantity(productId, quantity) {
        const item = market?.items.find((entry) => entry.productId === productId);
        setMarket((current) =>
          current
            ? {
                ...current,
                items: current.items.map((entry) =>
                  entry.productId === productId ? { ...entry, quantity } : entry,
                ),
              }
            : current,
        );
        if (item) {
          void persistMarketItem(item.id, { quantity }).catch((error: unknown) => {
            showToast(error instanceof Error ? error.message : "No se pudo guardar la cantidad");
          });
        }
      },
      updateMarketPrice(productId, unitPrice) {
        const item = market?.items.find((entry) => entry.productId === productId);
        setMarket((current) =>
          current
            ? {
                ...current,
                items: current.items.map((entry) =>
                  entry.productId === productId ? { ...entry, unitPrice } : entry,
                ),
              }
            : current,
        );
        if (item) {
          void persistMarketItem(item.id, { unitPrice }).catch((error: unknown) => {
            showToast(error instanceof Error ? error.message : "No se pudo guardar el precio");
          });
        }
      },
      markPurchased(productId) {
        const item = market?.items.find((entry) => entry.productId === productId);
        if (item && item.unitPrice <= 0) {
          showToast("Ingresa el precio de góndola antes de marcar el producto.");
          return;
        }
        setMarket((current) =>
          current
            ? {
                ...current,
                items: current.items.map((entry) =>
                  entry.productId === productId ? { ...entry, purchased: true } : entry,
                ),
              }
            : current,
        );
        if (item) {
          void persistMarketItem(item.id, { purchased: true }).catch((error: unknown) => {
            showToast(error instanceof Error ? error.message : "No se pudo marcar el producto");
          });
        }
      },
      returnToPending(productId) {
        const item = market?.items.find((entry) => entry.productId === productId);
        setMarket((current) =>
          current
            ? {
                ...current,
                items: current.items.map((entry) =>
                  entry.productId === productId ? { ...entry, purchased: false } : entry,
                ),
              }
            : current,
        );
        if (item) {
          void persistMarketItem(item.id, { purchased: false }).catch((error: unknown) => {
            showToast(error instanceof Error ? error.message : "No se pudo devolver el producto");
          });
        }
        showToast("El producto volvió a pendientes");
      },
      async finishMarket() {
        if (!market) return false;
        const purchased = market.items.filter((item) => item.purchased);
        if (purchased.length === 0) {
          showToast("Marca al menos un producto comprado para finalizar.");
          return false;
        }
        const productById = new Map(products.map((product) => [product.id, product]));
        try {
          const entry = await persistFinishMarket({
            marketId: market.id,
            store: market.store,
            date: market.date,
            purchased: purchased.map((item) => {
              const product = productById.get(item.productId);
              return {
                productId: item.productId,
                name: product?.name ?? "Producto",
                quantity: item.quantity,
                unit: product?.unit ?? "unidades",
                total: item.unitPrice,
              };
            }),
          });
          setHistory((current) => [entry, ...current]);
          setProducts((currentProducts) =>
            currentProducts.map((product) => {
              const bought = purchased.find((item) => item.productId === product.id);
              if (!bought) return product;
              return {
                ...product,
                lastPrice: bought.unitPrice,
                lastPurchasedAt: market.date,
                lastStore: market.store,
                priceHistory: [
                  {
                    date: market.date,
                    store: market.store,
                    quantity: bought.quantity,
                    unitPrice: Math.round(bought.unitPrice / Math.max(bought.quantity, 1)),
                    total: bought.unitPrice,
                  },
                  ...product.priceHistory,
                ],
              };
            }),
          );
          setMarket(null);
          showToast("Mercado finalizado y guardado.");
          return true;
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo finalizar el mercado");
          return false;
        }
      },
      getProduct(id) {
        return products.find((product) => product.id === id);
      },
      async createHouseholdUser(input) {
        const email = input.email.trim().toLowerCase();
        const displayName = input.displayName.trim() || email.split("@")[0];
        if (!email.includes("@")) {
          showToast("Escribe un correo válido.");
          return false;
        }
        if (input.password.length < 6) {
          showToast("La contraseña debe tener al menos 6 caracteres.");
          return false;
        }
        try {
          setHouseholdUsers(await createHouseholdUserRequest({ ...input, email, displayName }));
          showToast("Usuario creado");
          return true;
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo crear el usuario");
          return false;
        }
      },
      async updateHouseholdUser(input) {
        try {
          const users = await updateHouseholdUserRequest(input);
          setHouseholdUsers(users);
          if (input.userId === currentUserId && input.displayName?.trim()) {
            setUserNameState(input.displayName.trim());
          }
          showToast("Usuario actualizado");
          return true;
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo actualizar el usuario");
          return false;
        }
      },
      async resetHouseholdUserPassword(userId, password) {
        if (password.length < 6) {
          showToast("La contraseña debe tener al menos 6 caracteres.");
          return false;
        }
        try {
          await resetHouseholdUserPasswordRequest(userId, password);
          showToast("Contraseña asignada");
          return true;
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo asignar la contraseña");
          return false;
        }
      },
      async removeHouseholdUser(userId) {
        try {
          setHouseholdUsers(await removeHouseholdUserRequest(userId));
          showToast("Usuario eliminado");
        } catch (error) {
          showToast(error instanceof Error ? error.message : "No se pudo eliminar el usuario");
        }
      },
      async signOut() {
        clearHouseholdCache();
        await getSupabase().auth.signOut();
        window.location.assign("/ingresar");
      },
    }),
    [
      currentUserId,
      householdUsers,
      isAdmin,
      history,
      currentMonth,
      market,
      month,
      monthlyBudget,
      notificationsOpen,
      products,
      selectedIds,
      stores,
      toast,
      userName,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState debe usarse dentro de AppProvider");
  }
  return context;
}

export function useMarketTotals() {
  const { market } = useAppState();
  const purchased = market?.items.filter((item) => item.purchased) ?? [];
  const pending = market?.items.filter((item) => !item.purchased) ?? [];
  const subtotal = purchased.reduce((sum, item) => sum + item.unitPrice, 0);
  const totalItems = market?.items.length ?? 0;
  const progress = totalItems === 0 ? 0 : Math.round((purchased.length / totalItems) * 100);
  return { purchased, pending, subtotal, totalItems, progress };
}

export function useMonthSummary(month: string) {
  const { history, market, products, monthlyBudget, currentMonth } = useAppState();
  const derived = monthSummaryFromHistory(history, products, month, monthlyBudget);
  const snapshots = currentMonth
    ? deriveMonthSnapshots(history, products, monthlyBudget, currentMonth)
    : [];
  const snapshot = snapshots.find((entry) => entry.key === month);
  return {
    snapshot,
    snapshots,
    finished: derived.finished,
    total: derived.total,
    markets: derived.markets,
    budget: derived.budget,
    previous: derived.previous,
    usage: derived.budget ? Math.round((derived.total / derived.budget) * 100) : 0,
    pendingCount: market?.items.filter((item) => !item.purchased).length ?? 0,
    latest: derived.finished,
    productCount: derived.productCount,
    categories: derived.categories,
  };
}

