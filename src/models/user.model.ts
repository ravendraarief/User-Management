export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'superadmin' | 'admin' | 'user';
    company: string;
    status: 'active' | 'inactive';
  }
  
  export let users: User[] = [];
  