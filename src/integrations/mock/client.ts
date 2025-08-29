// Mock client to replace Supabase functionality
// This is a temporary mock - replace with your actual backend implementation

const createQueryBuilder = () => ({
  eq: (column: string, value: unknown) => createQueryBuilder(),
  neq: (column: string, value: unknown) => createQueryBuilder(),
  like: (column: string, value: unknown) => createQueryBuilder(),
  or: (query: string) => createQueryBuilder(),
  order: (column: string, options?: unknown) => createQueryBuilder(),
  limit: (count: number) => createQueryBuilder(),
  single: () => Promise.resolve({ data: null, error: null }),
  then: (onFulfilled?: (value: { data: unknown[]; error: unknown }) => unknown) => 
    Promise.resolve({ data: [], error: null }).then(onFulfilled),
});

export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => createQueryBuilder(),
    insert: (data: unknown) => Promise.resolve({ data: null, error: null }),
    update: (data: unknown) => ({
      eq: (column: string, value: unknown) => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: (column: string, value: unknown) => Promise.resolve({ data: null, error: null }),
    }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    signUp: (data: unknown) => Promise.resolve({ data: { user: null }, error: null }),
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => Promise.resolve({ data: null, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
    }),
  },
  rpc: (functionName: string, params?: unknown) => Promise.resolve({ data: null, error: null }),
  channel: (name: string) => ({
    on: (event: string, table: string, callback: (...args: unknown[]) => void) => ({
      subscribe: () => {},
    }),
    subscribe: () => {},
  }),
  removeChannel: (channel: unknown) => {},
  functions: {
    invoke: (functionName: string, options?: unknown) => Promise.resolve({ data: null, error: null }),
  },
};

export default supabase;