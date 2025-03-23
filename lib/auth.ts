// lib/api.ts

const BASE_URL = "https://api.streamhivex.icu";

// Interfaces baseadas na API
interface UserResponse {
  id: string;
  nome: string;
  email: string;
  url_avatar?: string;
  criado_em?: string;
}

interface LoginResponse {
  status: number;
  message: string;
  user: UserResponse;
  token: string;
}

interface RegisterResponse {
  status: number;
  message: string;
  data: UserResponse;
  token: string; // Presumindo que o backend retorna token após registro
}

interface ValidateTokenResponse {
  user: UserResponse;
}

// Função para login padrão
export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    throw new Error(`Erro no login: ${response.status}`);
  }

  return await response.json();
}

// Função para registro de usuário
export async function register(nome: string, email: string, senha: string): Promise<RegisterResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, email, senha }),
  });

  if (!response.ok) {
    throw new Error(`Erro no registro: ${response.status}`);
  }

  const data = await response.json();
  
  // Como o endpoint de registro não retorna um token diretamente, 
  // fazemos o login imediatamente após o registro bem-sucedido
  if (!data.token) {
    const loginData = await login(email, senha);
    return {
      ...data,
      token: loginData.token
    };
  }
  
  return data;
}

// Função para login social com Google
export async function socialLogin(email: string, nome: string, token_firebase: string): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/social`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, nome, token_firebase }),
  });

  if (!response.ok) {
    throw new Error(`Erro no login social: ${response.status}`);
  }

  return await response.json();
}

// Função para validar token (verificar autenticação)
export async function validateToken(token: string): Promise<ValidateTokenResponse> {
  // Como não há um endpoint específico para validação de token na documentação,
  // podemos usar o endpoint de perfis que requer autenticação
  const response = await fetch(`${BASE_URL}/api/perfis`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Token inválido ou expirado");
  }

  // Presumindo que retornamos o usuário autenticado do endpoint de perfis
  // Esta parte pode precisar de adaptação conforme a API real
  const data = await response.json();
  
  // Criamos um objeto que atende à interface ValidateTokenResponse
  // Você precisará adaptar isso com base na sua API real
  return {
    user: {
      id: localStorage.getItem("user_id") || "",
      nome: localStorage.getItem("user_nome") || "",
      email: localStorage.getItem("user_email") || "",
      url_avatar: localStorage.getItem("user_avatar") || "",
      criado_em: localStorage.getItem("user_criado_em") || ""
    }
  };
}