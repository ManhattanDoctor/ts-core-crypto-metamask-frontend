# @ts-core/crypto-metamask-frontend

Фронтенд TypeScript библиотека для подписания и верификации сообщений с использованием кошелька Metamask в браузере. Использует метод `personal_sign` (EIP-191) для безопасного подписания сообщений.

## Содержание

- [Установка](#установка)
- [Зависимости](#зависимости)
- [Быстрый старт](#быстрый-старт)
- [API Reference](#api-reference)
- [Интеграция с TransportCryptoManager](#интеграция-с-transportcryptomanager)
- [Примеры использования](#примеры-использования)
- [Безопасность](#безопасность)
- [Связанные пакеты](#связанные-пакеты)

## Установка

```bash
npm install @ts-core/crypto-metamask-frontend
```

```bash
yarn add @ts-core/crypto-metamask-frontend
```

```bash
pnpm add @ts-core/crypto-metamask-frontend
```

## Зависимости

| Пакет | Описание |
|-------|----------|
| `@ts-core/common` | Базовые классы и интерфейсы |

## Быстрый старт

### Подписание сообщения

```typescript
import { Metamask } from '@ts-core/crypto-metamask-frontend';

// Получение провайдера Metamask (window.ethereum)
const wallet = window.ethereum;

// Получение адреса пользователя
const accounts = await wallet.request({ method: 'eth_requestAccounts' });
const address = accounts[0];

// Подписание сообщения
const message = 'Привет, Ethereum!';
const signature = await Metamask.sign(message, address, wallet);
console.log('Подпись:', signature);
```

### Верификация подписи

```typescript
import { Metamask } from '@ts-core/crypto-metamask-frontend';

const message = 'Привет, Ethereum!';
const signature = '0x...';
const address = '0x...';

const isValid = await Metamask.verify(message, signature, address, wallet);
console.log('Валидна:', isValid);  // true или false
```

## API Reference

### Класс Metamask

Статический класс для работы с подписями Metamask:

```typescript
class Metamask {
    static ALGORITHM = 'KeccakMetamask';  // Идентификатор алгоритма

    static sign(message: string, address: string, wallet: any): Promise<string>;
    static verify(message: string, signature: string, address: string, wallet: any): Promise<boolean>;
}
```

### Методы

| Метод | Возвращаемый тип | Описание |
|-------|------------------|----------|
| `sign(message, address, wallet)` | `Promise<string>` | Подписать сообщение через Metamask |
| `verify(message, signature, address, wallet)` | `Promise<boolean>` | Верифицировать подпись |

### Параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `message` | `string` | Сообщение для подписи или верификации |
| `address` | `string` | Ethereum адрес (с префиксом 0x) |
| `signature` | `string` | Подпись в hex формате |
| `wallet` | `any` | Провайдер Metamask (window.ethereum) |

## Интеграция с TransportCryptoManager

Библиотека предоставляет `TransportCryptoManagerMetamaskFrontend` для интеграции с транспортной системой:

```typescript
import { TransportCryptoManagerMetamaskFrontend } from '@ts-core/crypto-metamask-frontend';

const cryptoManager = new TransportCryptoManagerMetamaskFrontend(wallet);

// Подписание транспортной команды
const signature = await cryptoManager.sign(command, nonce, address);

// Верификация транспортной команды
const isValid = await cryptoManager.verify(command, {
    value: signature,
    nonce: nonce,
    publicKey: address
});
```

## Примеры использования

### Авторизация через Metamask

```typescript
import { Metamask } from '@ts-core/crypto-metamask-frontend';

async function loginWithMetamask(): Promise<{ address: string; signature: string; message: string }> {
    // Проверка установки Metamask
    if (typeof window.ethereum === 'undefined') {
        throw new Error('Metamask не установлен');
    }

    const wallet = window.ethereum;

    // Запрос доступа к аккаунту
    const accounts = await wallet.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    // Создание сообщения для авторизации с timestamp
    const timestamp = Date.now();
    const message = `Вход в MyApp\nTimestamp: ${timestamp}`;

    // Подписание сообщения
    const signature = await Metamask.sign(message, address, wallet);

    return { address, signature, message };
}

// Использование
const { address, signature, message } = await loginWithMetamask();
// Отправка на сервер для верификации
await api.login({ address, signature, message });
```

### Подтверждение действия

```typescript
import { Metamask } from '@ts-core/crypto-metamask-frontend';

async function confirmTransaction(
    to: string,
    amount: string
): Promise<{ signature: string; message: string }> {
    const wallet = window.ethereum;
    const accounts = await wallet.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    // Формирование сообщения с деталями операции
    const message = JSON.stringify({
        action: 'transfer',
        to: to,
        amount: amount,
        timestamp: Date.now()
    });

    // Подпись
    const signature = await Metamask.sign(message, address, wallet);

    return { signature, message };
}
```

### Полный цикл подписи и верификации

```typescript
import { Metamask } from '@ts-core/crypto-metamask-frontend';

async function signAndVerify(): Promise<void> {
    const wallet = window.ethereum;
    const accounts = await wallet.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    // Сообщение для подписи
    const message = JSON.stringify({
        action: 'transfer',
        to: '0x...',
        amount: '1.5',
        timestamp: Date.now()
    });

    // Подпись
    const signature = await Metamask.sign(message, address, wallet);
    console.log('Подписано:', signature);

    // Локальная верификация
    const isValid = await Metamask.verify(message, signature, address, wallet);
    console.log('Валидно:', isValid);

    // Отправка на бэкенд для финальной верификации
    const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature, address })
    });
}
```

### Сервис авторизации Angular

```typescript
import { Injectable } from '@angular/core';
import { Metamask } from '@ts-core/crypto-metamask-frontend';

@Injectable({ providedIn: 'root' })
export class MetamaskAuthService {
    private wallet: any;

    constructor(private http: HttpClient) {
        this.wallet = (window as any).ethereum;
    }

    async isInstalled(): Promise<boolean> {
        return typeof this.wallet !== 'undefined';
    }

    async connect(): Promise<string> {
        const accounts = await this.wallet.request({ method: 'eth_requestAccounts' });
        return accounts[0];
    }

    async login(): Promise<{ token: string }> {
        const address = await this.connect();

        // Получение nonce от сервера
        const { nonce } = await this.http.get<{ nonce: string }>(
            `/api/auth/nonce/${address}`
        ).toPromise();

        // Подпись nonce
        const message = `Вход в приложение\nNonce: ${nonce}`;
        const signature = await Metamask.sign(message, address, this.wallet);

        // Верификация на сервере и получение токена
        return this.http.post<{ token: string }>('/api/auth/verify', {
            address,
            signature,
            message
        }).toPromise();
    }
}
```

## Безопасность

### Формат сообщения (EIP-191)

Метод `personal_sign` автоматически добавляет префикс к сообщению:

```
"\x19Ethereum Signed Message:\n" + message.length + message
```

Это предотвращает подпись произвольных транзакций через `personal_sign`.

### Рекомендации

1. **Используйте timestamp или nonce** — предотвращает replay-атаки
2. **Включайте домен** — защита от фишинга
3. **Ограничивайте срок действия** — подписи должны иметь время жизни

```typescript
// Хороший формат сообщения
const message = [
    'Вход в MyApp',
    `Домен: ${window.location.host}`,
    `Адрес: ${address}`,
    `Время: ${new Date().toISOString()}`,
    `Nonce: ${serverNonce}`
].join('\n');
```

### Серверная верификация

Для безопасной верификации на сервере используйте `@ts-core/crypto-metamask-backend`:

```typescript
// Сервер (Node.js)
import { Metamask } from '@ts-core/crypto-metamask-backend';

const isValid = Metamask.verify(message, signature, address);
```

## Совместимость

Библиотека работает с любым EIP-1193 совместимым кошельком:

- Metamask
- WalletConnect
- Coinbase Wallet
- Trust Wallet
- Rainbow
- И другие

## Обработка ошибок

```typescript
try {
    const signature = await Metamask.sign(message, address, wallet);
} catch (error) {
    if (error.code === 4001) {
        // Пользователь отклонил запрос
        console.log('Подпись отменена пользователем');
    } else if (error.code === -32002) {
        // Уже есть ожидающий запрос
        console.log('Запрос уже в обработке');
    } else {
        console.error('Ошибка подписи:', error);
    }
}
```

## Связанные пакеты

| Пакет | Описание |
|-------|----------|
| `@ts-core/crypto-metamask-backend` | Серверная верификация подписей Metamask |
| `@ts-core/eth` | Работа с Ethereum блокчейном |

## Автор

**Renat Gubaev** — [renat.gubaev@gmail.com](mailto:renat.gubaev@gmail.com)

- GitHub: [ManhattanDoctor](https://github.com/ManhattanDoctor)
- Репозиторий: [ts-core-crypto-metamask-frontend](https://github.com/ManhattanDoctor/ts-core-crypto-metamask-frontend)

## Лицензия

ISC
