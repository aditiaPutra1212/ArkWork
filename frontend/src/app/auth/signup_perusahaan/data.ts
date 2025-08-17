// frontend/src/app/auth/signup_perusahaan/data.ts
import { Package } from './types';

export const PACKAGES: Package[] = [
  { id: 'free', title: 'Free Trial', price: 0, features: [
    '1 Job Post aktif','Durasi 7 hari','Basic listing','Tanpa highlight','Basic analytics',
  ]},
  { id: 'starter', title: 'Starter', price: 149000, features: [
    '3 Job Post aktif','Durasi 14 hari','Highlight listing','Basic analytics','Email support',
  ]},
  { id: 'basic', title: 'Basic', price: 249000, features: [
    '5 Job Post aktif','Durasi 30 hari','Highlight + Badge','Standard analytics','Email support',
  ]},
  { id: 'business', title: 'Business', price: 499000, features: [
    '12 Job Post aktif','Durasi 45 hari','Homepage spotlight','Advanced analytics','Priority support',
  ]},
  { id: 'premium', title: 'Premium', price: 899000, features: [
    'Unlimited Job Post (aktif)','Durasi 60 hari','Homepage spotlight','Advanced analytics','Dedicated success',
  ]},
];
