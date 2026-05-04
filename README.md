# tirnest

Tirnest, Vite + React + TypeScript ile oluşturulmuş modern bir web uygulamasıdır. Tailwind CSS ile stilize edilmiş olup, Supabase entegrasyonu ve PDF oluşturma özellikleri içerir.

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-97xt3cg3)

## 🚀 Özellikler

- ⚡ **Vite** - Hızlı geliştirme deneyimi
- ⚛️ **React 18** - Modern UI kütüphanesi
- 🔷 **TypeScript** - Tip güvenliği
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔗 **Lucide React** - Güzel ikonlar
- 🗄️ **Supabase** - Backend entegrasyonu
- 📄 **PDF Oluşturma** - html2canvas ve jsPDF ile PDF export

## 📦 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Adımlar

1. Depoyu klonlayın:
```bash
git clone <repository-url>
cd tirnest
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda açın:
```
http://localhost:5173
```

## 🛠️ Kullanım

### Geliştirme

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npm run typecheck
```

### Preview

```bash
npm run preview
```

## 📁 Proje Yapısı

```
tirnest/
├── src/
│   ├── components/    # React bileşenleri
│   ├── lib/          # Yardımcı kütüphaneler
│   ├── utils/        # Yardımcı fonksiyonlar
│   ├── App.tsx       # Ana uygulama bileşeni
│   ├── main.tsx      # Giriş noktası
│   └── types.ts      # TypeScript tipleri
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔧 Yapılandırma

- **Vite**: `vite.config.ts`
- **TypeScript**: `tsconfig.json`, `tsconfig.app.json`
- **Tailwind CSS**: `tailwind.config.js`
- **ESLint**: `eslint.config.js`
- **PostCSS**: `postcss.config.js`

## 📝 Lisans

MIT
