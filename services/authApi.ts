import { User } from "../types";

const API_BASE_URL = "http://10.0.2.2:8080";

export const authApi = {
  verifyOTP: async (email: string, otp: string): Promise<void> => {
    if (!email || !otp) {
      throw new Error("All fields are required");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 100000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verifyOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          
          if (errorData.error && errorData.error.message) {
            throw new Error(errorData.error.message);
          }
          
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          
          throw new Error("Verification failed");
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
          throw parseError;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Network error");
    }
  },

  login: async (
    username: string,
    password: string
  ): Promise<string> => {
    if (!username || !password) {
      throw new Error("All fields are required");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 100000);

    try {
      console.log('LOGIN Request Body:', JSON.stringify({
        username,
        password: "***hidden***" 
      }, null, 2));
      console.log('LOGIN Request URL:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          
          if (errorData.message && errorData.message.messageDetail) {
            throw new Error(errorData.message.messageDetail);
          }
          
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          
          throw new Error("Login failed");
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          } else {
            throw parseError;
          }
        }
      }

      const responseData = await response.json();
      
      if (!responseData.isSuccess) {
        throw new Error(responseData.message?.messageDetail || "Login failed");
      }
      
      const { data } = responseData;
      const { accessToken } = data;
      
      if (!accessToken) {
        throw new Error("No access token received");
      }

      console.log('Login successful, token received');
      return accessToken;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbورتError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during login");
      }
    }
  },

  getUserDetail: async (token: string): Promise<User> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log('GET USER DETAIL Request URL:', `${API_BASE_URL}/api/user/get-detail`);
      
      const response = await fetch(`${API_BASE_URL}/api/user/get-detail`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          
          if (errorData.message && errorData.message.messageDetail) {
            throw new Error(errorData.message.messageDetail);
          }
          
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          
          throw new Error("Failed to get user details");
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          } else {
            throw parseError;
          }
        }
      }

      const responseData = await response.json();
      
      if (!responseData.isSuccess) {
        throw new Error(responseData.message?.messageDetail || "Failed to get user details");
      }
      
      const { data } = responseData;
      
      if (!data.username || !data.email || !data.role) {
        throw new Error("Invalid user data received");
      }

      console.log('User details retrieved successfully');
      return {
        username: data.username,
        email: data.email,
        role: data.role
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred while getting user details");
      }
    }
  },

  register: async (
    username: string,
    email: string,
    password: string,
    repassword: string
  ): Promise<void> => {
    if (!email || !password || !repassword || !username) {
      throw new Error("All fields are required");
    }
    if (password !== repassword) {
      throw new Error("Passwords do not match");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log('REGISTER Request Body:', JSON.stringify({
        username,
        email,
        password: "***hidden***" 
      }, null, 2));
      console.log('REGISTER Request URL:', `${API_BASE_URL}/api/auth/register`);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          
          if (errorData.error && errorData.error.message) {
            throw new Error(errorData.error.message);
          }
          
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          
          throw new Error("Registration failed");
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          } else {
            throw parseError;
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during registration");
      }
    }
  },
};

export const forgotPassword = async (email: string, username: string): Promise<void> => {
  if (!email || !username) {
    throw new Error("Email and username are required");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    console.log('FORGOT PASSWORD Request Body:', JSON.stringify({
      email,
      username
    }, null, 2));
    console.log('FORGOT PASSWORD Request URL:', `${API_BASE_URL}/api/user/forget-password`);
    
    const response = await fetch(`${API_BASE_URL}/api/user/forget-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        
        if (errorData.message && errorData.message.messageDetail) {
          throw new Error(errorData.message.messageDetail);
        }
        
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        
        if (errorData.error && errorData.error.message) {
          throw new Error(errorData.error.message);
        }
        
        throw new Error("Forgot password request failed");
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        } else {
          throw parseError;
        }
      }
    }

    // Xử lý response thành công
    const responseData = await response.json();
    
    if (responseData.isSuccess === false) {
      throw new Error(responseData.message?.messageDetail || "Forgot password request failed");
    }

    console.log('Forgot password request sent successfully');
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    } else if (error instanceof TypeError) {
      throw new Error("Network error");
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unknown error occurred during forgot password request");
    }
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};