import { User, UserProfile } from "../types";

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


      return accessToken;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
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
  getUserProfile: async (token: string): Promise<UserProfile> => {
    if (!token) {
      throw new Error("Token is required");
    }
  
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
  
    try {

      
      const response = await fetch(`${API_BASE_URL}/api/profile/user`, {
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
          
          throw new Error("Failed to get user profile");
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
        throw new Error(responseData.message?.messageDetail || "Failed to get user profile");
      }
      
      const { data } = responseData;
      if (!data.fullName || !data.gender) {
        throw new Error("Invalid user profile data received");
      }
  

      return {
        nickName: data.nickName || "", 
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
        dateOfBirth: data.dateOfBirth || "", 
        avatar: data.avatar || "",
        gender: data.gender || "",
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
        throw new Error("An unknown error occurred while getting user profile");
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

  updateProfile: async (token: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!token) {
      throw new Error("Token is required");
    }
  
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
  
    try {

      
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
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
          
          throw new Error("Failed to update profile");
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
        throw new Error(responseData.message?.messageDetail || "Failed to update profile");
      }
      
      const { data } = responseData;
      
      return {
        nickName: data.nickName || "",
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
        dateOfBirth: data.dateOfBirth || "",
        avatar: data.avatar || "",
        gender: data.gender || "",
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
        throw new Error("An unknown error occurred while updating profile");
      }
    }
  },

  uploadImage: async (token: string, file: any): Promise<string> => {
    if (!token) {
      throw new Error("Token is required");
    }
    
    if (!file || !file.uri) {
      throw new Error("Valid file with URI is required");
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const formData = new FormData();
      
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg', 
        name: file.name || 'avatar.jpg'
      } as any);
      
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      
      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message?.messageDetail) {
            throw new Error(errorData.message.messageDetail);
          }
          if (errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const responseData = await response.json();
      
      if (!responseData.isSuccess) {
        throw new Error(responseData.message?.messageDetail || "Failed to upload image");
      }
      
      const { data } = responseData;
      
      if (!data || !data.url) {
        throw new Error("Invalid upload response - no image URL received");
      }
      
      const imageUrl = data.url;
      return imageUrl;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Image upload timed out");
      } else if (error instanceof TypeError) {
        throw new Error("Network error during image upload");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred during image upload");
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

    const responseData = await response.json();
    
    if (responseData.isSuccess === false) {
      throw new Error(responseData.message?.messageDetail || "Forgot password request failed");
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
      throw new Error("An unknown error occurred during forgot password request");
    }
  }
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<void> => {
  if (!email || !otp || !newPassword) {
    throw new Error("Email, OTP and new password are required");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    
    const response = await fetch(`${API_BASE_URL}/api/user/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
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
        
        throw new Error("Password reset failed");
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        } else {
          throw parseError;
        }
      }
    }

    const responseData = await response.json();
    
    if (responseData.isSuccess === false) {
      throw new Error(responseData.message?.messageDetail || "Password reset failed");
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
      throw new Error("An unknown error occurred during password reset");
    }
  }
  
};
