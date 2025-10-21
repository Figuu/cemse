# CEMSE Jobs Module - React Native/Expo Mobile Implementation Guide

## Overview

This guide provides comprehensive specifications for implementing the CEMSE Jobs and Youth Applications module on React Native with Expo. Based on the analysis of the existing web implementation, this document outlines all necessary components, services, and patterns needed to replicate the full functionality.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Authentication](#authentication)
3. [API Services](#api-services)
4. [State Management](#state-management)
5. [Components](#components)
6. [Screens](#screens)
7. [Navigation](#navigation)
8. [File Structure](#file-structure)
9. [Testing Strategy](#testing-strategy)
10. [Performance Optimization](#performance-optimization)

## 1. Project Setup

### Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@expo/vector-icons": "^14.0.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/drawer": "^6.6.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.47.0",
    "expo-secure-store": "~12.5.0",
    "expo-file-system": "~16.0.0",
    "expo-document-picker": "~11.7.0",
    "expo-image-picker": "~14.5.0",
    "expo-location": "~16.5.0",
    "react-native-maps": "1.8.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-paper": "^5.11.0",
    "react-native-vector-icons": "^10.0.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "react-native-flash-message": "^0.4.2",
    "react-native-modal": "^13.0.1",
    "react-native-skeleton-placeholder": "^5.2.4",
    "react-native-image-viewing": "^0.2.2"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "@types/react-native": "~0.73.0",
    "typescript": "^5.2.0",
    "@testing-library/react-native": "^12.4.0",
    "jest": "^29.7.0",
    "detox": "^20.13.0"
  }
}
```

### Expo Configuration

```json
{
  "expo": {
    "name": "CEMSE Jobs",
    "slug": "cemse-jobs",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.cemse.jobs"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.cemse.jobs",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store",
      "expo-document-picker",
      "expo-image-picker",
      "expo-location"
    ]
  }
}
```

## 2. Authentication

### Auth Service

```typescript
// services/auth.ts
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  role: 'YOUTH' | 'COMPANY' | 'INSTITUTION' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  profileComplete: boolean;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // Get CSRF token
      const csrfResponse = await api.get('/auth/csrf');
      const csrfToken = csrfResponse.data.csrfToken;

      // Perform login
      const loginResponse = await api.post('/auth/callback/credentials', {
        email: credentials.email,
        password: credentials.password,
        csrfToken,
        json: true
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Get session
      const sessionResponse = await api.get('/auth/session');
      const user = sessionResponse.data.user;

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Store tokens securely
      await SecureStore.setItemAsync(this.TOKEN_KEY, sessionResponse.headers['authorization'] || 'session');
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));

      return { user, token: 'session' };
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    await SecureStore.deleteItemAsync(this.USER_KEY);
    await api.post('/auth/signout');
  }

  static async getStoredUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }
}
```

### Auth Store

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { AuthService } from '../services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { user, token } = await AuthService.login(credentials);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const user = await AuthService.getStoredUser();
      const token = await AuthService.getStoredToken();

      if (user && token) {
        set({ user, token, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

## 3. API Services

### Base API Configuration

```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://cemse.boring.lat/api';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token && token !== 'session') {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('user_data');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  get(url: string, config?: AxiosRequestConfig) {
    return this.instance.get(url, config);
  }

  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.post(url, data, config);
  }

  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.put(url, data, config);
  }

  delete(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete(url, config);
  }
}

export const api = new ApiService();
```

### Jobs API Service

```typescript
// services/jobsApi.ts
import { api } from './api';

export interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    location: string;
    website?: string;
  };
  location: string | { lat: number; lng: number; address: string };
  contractType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'VOLUNTEER' | 'FREELANCE';
  workModality: 'REMOTE' | 'HYBRID' | 'ONSITE';
  experienceLevel: 'NO_EXPERIENCE' | 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL';
  educationRequired?: string;
  skillsRequired: string[];
  desiredSkills?: string[];
  requirements: string[];
  benefits: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  isApplied: boolean;
  isBookmarked: boolean;
  viewsCount: number;
  applicationsCount: number;
  featured: boolean;
  urgent: boolean;
}

export interface JobFilters {
  search?: string;
  location?: string;
  type?: string;
  experience?: string;
  salary?: string;
  sortBy?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  appliedDate: string;
  status: 'applied' | 'reviewing' | 'shortlisted' | 'rejected' | 'offered';
  priority: 'low' | 'medium' | 'high';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  jobType: string;
  remote: boolean;
  experience: string;
  skills: string[];
  notes?: string;
  nextSteps: string;
  timeline: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'current';
  }>;
  daysSinceApplied: number;
  responseTime?: number;
}

export class JobsApiService {
  // Get all jobs with filters
  static async getJobs(filters?: JobFilters): Promise<{ jobs: Job[]; success: boolean }> {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await api.get(`/jobs?${params}`);
    return response.data;
  }

  // Get specific job details
  static async getJob(id: string): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  }

  // Apply for a job
  static async applyForJob(jobId: string, coverLetter: string): Promise<{ success: boolean; application: any }> {
    const response = await api.post('/applications', {
      jobId,
      coverLetter
    });
    return response.data;
  }

  // Get user applications
  static async getMyApplications(filters?: { status?: string; search?: string }): Promise<{ applications: Application[]; success: boolean }> {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await api.get(`/applications?${params}`);
    return response.data;
  }

  // Get application details
  static async getApplication(id: string): Promise<Application> {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  }

  // Update application status (company side)
  static async updateApplicationStatus(id: string, status: string, reason?: string): Promise<{ success: boolean }> {
    const response = await api.put(`/applications/${id}`, { status, reason });
    return response.data;
  }

  // Bookmark job
  static async bookmarkJob(jobId: string): Promise<{ success: boolean }> {
    const response = await api.post(`/jobs/bookmarked`, { jobId });
    return response.data;
  }

  // Get bookmarked jobs
  static async getBookmarkedJobs(): Promise<{ jobs: Job[]; success: boolean }> {
    const response = await api.get('/jobs/bookmarked');
    return response.data;
  }

  // Create job posting (if user has company)
  static async createJob(jobData: Partial<Job>): Promise<{ success: boolean; job: Job }> {
    // First get user's company
    const companiesResponse = await api.get('/companies/by-user/me');
    const companyId = companiesResponse.data.id;

    const response = await api.post(`/companies/${companyId}/jobs`, jobData);
    return response.data;
  }

  // Get jobs posted by user's company
  static async getMyPostedJobs(): Promise<{ jobs: Job[]; success: boolean }> {
    const companiesResponse = await api.get('/companies/by-user/me');
    const companyId = companiesResponse.data.id;

    const response = await api.get(`/companies/${companyId}/jobs`);
    return response.data;
  }

  // Get applications for posted job
  static async getJobApplications(jobId: string): Promise<{ applications: Application[]; success: boolean }> {
    const companiesResponse = await api.get('/companies/by-user/me');
    const companyId = companiesResponse.data.id;

    const response = await api.get(`/companies/${companyId}/jobs/${jobId}/applications`);
    return response.data;
  }
}
```

## 4. State Management

### Jobs Store

```typescript
// stores/jobsStore.ts
import { create } from 'zustand';
import { JobsApiService, Job, JobFilters } from '../services/jobsApi';

interface JobsState {
  jobs: Job[];
  filters: JobFilters;
  loading: boolean;
  error: string | null;
  selectedJob: Job | null;

  // Actions
  setJobs: (jobs: Job[]) => void;
  setFilters: (filters: JobFilters) => void;
  setSelectedJob: (job: Job | null) => void;
  fetchJobs: () => Promise<void>;
  fetchJob: (id: string) => Promise<void>;
  applyForJob: (jobId: string, coverLetter: string) => Promise<void>;
  bookmarkJob: (jobId: string) => Promise<void>;
  clearError: () => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  filters: {},
  loading: false,
  error: null,
  selectedJob: null,

  setJobs: (jobs) => set({ jobs }),
  setFilters: (filters) => set({ filters }),
  setSelectedJob: (selectedJob) => set({ selectedJob }),
  clearError: () => set({ error: null }),

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const response = await JobsApiService.getJobs(filters);
      set({ jobs: response.jobs, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchJob: async (id) => {
    set({ loading: true, error: null });
    try {
      const job = await JobsApiService.getJob(id);
      set({ selectedJob: job, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  applyForJob: async (jobId, coverLetter) => {
    set({ loading: true, error: null });
    try {
      await JobsApiService.applyForJob(jobId, coverLetter);

      // Update job status in store
      const { jobs, selectedJob } = get();
      const updatedJobs = jobs.map(job =>
        job.id === jobId ? { ...job, isApplied: true } : job
      );

      set({
        jobs: updatedJobs,
        selectedJob: selectedJob?.id === jobId ? { ...selectedJob, isApplied: true } : selectedJob,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  bookmarkJob: async (jobId) => {
    try {
      await JobsApiService.bookmarkJob(jobId);

      // Update bookmark status in store
      const { jobs, selectedJob } = get();
      const updatedJobs = jobs.map(job =>
        job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
      );

      set({
        jobs: updatedJobs,
        selectedJob: selectedJob?.id === jobId ? { ...selectedJob, isBookmarked: !selectedJob.isBookmarked } : selectedJob
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
```

### Applications Store

```typescript
// stores/applicationsStore.ts
import { create } from 'zustand';
import { JobsApiService, Application } from '../services/jobsApi';

interface ApplicationsState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  selectedApplication: Application | null;
  filters: { status?: string; search?: string };

  // Actions
  setApplications: (applications: Application[]) => void;
  setSelectedApplication: (application: Application | null) => void;
  setFilters: (filters: { status?: string; search?: string }) => void;
  fetchApplications: () => Promise<void>;
  fetchApplication: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  loading: false,
  error: null,
  selectedApplication: null,
  filters: {},

  setApplications: (applications) => set({ applications }),
  setSelectedApplication: (selectedApplication) => set({ selectedApplication }),
  setFilters: (filters) => set({ filters }),
  clearError: () => set({ error: null }),

  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const response = await JobsApiService.getMyApplications(filters);
      set({ applications: response.applications, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchApplication: async (id) => {
    set({ loading: true, error: null });
    try {
      const application = await JobsApiService.getApplication(id);
      set({ selectedApplication: application, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

## 5. Components

### Job Card Component

```typescript
// components/JobCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../services/jobsApi';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onPress: () => void;
  onBookmark: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress, onBookmark }) => {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;

    const min = job.salaryMin ? `${job.salaryMin.toLocaleString()}` : '';
    const max = job.salaryMax ? `${job.salaryMax.toLocaleString()}` : '';
    const range = min && max ? `${min} - ${max}` : min || max;

    return `${range} ${job.salaryCurrency}`;
  };

  const getContractTypeLabel = (type: string) => {
    const labels = {
      'FULL_TIME': 'Tiempo Completo',
      'PART_TIME': 'Medio Tiempo',
      'INTERNSHIP': 'Pasantía',
      'VOLUNTEER': 'Voluntario',
      'FREELANCE': 'Freelance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels = {
      'NO_EXPERIENCE': 'Sin Experiencia',
      'ENTRY_LEVEL': 'Nivel Inicial',
      'MID_LEVEL': 'Nivel Intermedio',
      'SENIOR_LEVEL': 'Nivel Senior'
    };
    return labels[level as keyof typeof labels] || level;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          {job.company.logo && (
            <Image source={{ uri: job.company.logo }} style={styles.companyLogo} />
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={styles.companyName}>{job.company.name}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onBookmark} style={styles.bookmarkButton}>
          <Ionicons
            name={job.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={job.isBookmarked ? "#007AFF" : "#666"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{getContractTypeLabel(job.contractType)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{getExperienceLevelLabel(job.experienceLevel)}</Text>
        </View>

        {formatSalary() && (
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{formatSalary()}</Text>
          </View>
        )}
      </View>

      <View style={styles.tags}>
        {job.skillsRequired?.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{skill}</Text>
          </View>
        ))}
        {job.skillsRequired?.length > 3 && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>+{job.skillsRequired.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.postedTime}>
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </Text>

        <View style={styles.statusContainer}>
          {job.isApplied && (
            <View style={styles.appliedBadge}>
              <Text style={styles.appliedText}>Aplicado</Text>
            </View>
          )}
          {job.urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>Urgente</Text>
            </View>
          )}
          {job.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Destacado</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 22,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookmarkButton: {
    padding: 4,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postedTime: {
    fontSize: 12,
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  appliedBadge: {
    backgroundColor: '#e8f5e8',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  appliedText: {
    fontSize: 10,
    color: '#2d7a2d',
    fontWeight: '500',
  },
  urgentBadge: {
    backgroundColor: '#ffe8e8',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  urgentText: {
    fontSize: 10,
    color: '#d63031',
    fontWeight: '500',
  },
  featuredBadge: {
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  featuredText: {
    fontSize: 10,
    color: '#856404',
    fontWeight: '500',
  },
});
```

### Job Filters Component

```typescript
// components/JobFilters.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { JobFilters } from '../services/jobsApi';

interface JobFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: JobFilters) => void;
  currentFilters: JobFilters;
}

export const JobFiltersModal: React.FC<JobFiltersProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<JobFilters>(currentFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {};
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Filtros</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Location Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <Picker
              selectedValue={filters.location || ''}
              onValueChange={(value) => setFilters({ ...filters, location: value })}
              style={styles.picker}
            >
              <Picker.Item label="Todas las ubicaciones" value="" />
              <Picker.Item label="Cochabamba" value="Cochabamba" />
              <Picker.Item label="La Paz" value="La Paz" />
              <Picker.Item label="Santa Cruz" value="Santa Cruz" />
              <Picker.Item label="Tarija" value="Tarija" />
              <Picker.Item label="Potosí" value="Potosí" />
              <Picker.Item label="Oruro" value="Oruro" />
              <Picker.Item label="Sucre" value="Sucre" />
              <Picker.Item label="Trinidad" value="Trinidad" />
              <Picker.Item label="Cobija" value="Cobija" />
            </Picker>
          </View>

          {/* Contract Type Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Contrato</Text>
            <Picker
              selectedValue={filters.type || ''}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
              style={styles.picker}
            >
              <Picker.Item label="Todos los tipos" value="" />
              <Picker.Item label="Tiempo Completo" value="FULL_TIME" />
              <Picker.Item label="Medio Tiempo" value="PART_TIME" />
              <Picker.Item label="Pasantía" value="INTERNSHIP" />
              <Picker.Item label="Voluntario" value="VOLUNTEER" />
              <Picker.Item label="Freelance" value="FREELANCE" />
            </Picker>
          </View>

          {/* Experience Level Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nivel de Experiencia</Text>
            <Picker
              selectedValue={filters.experience || ''}
              onValueChange={(value) => setFilters({ ...filters, experience: value })}
              style={styles.picker}
            >
              <Picker.Item label="Todos los niveles" value="" />
              <Picker.Item label="Sin Experiencia" value="NO_EXPERIENCE" />
              <Picker.Item label="Nivel Inicial" value="ENTRY_LEVEL" />
              <Picker.Item label="Nivel Intermedio" value="MID_LEVEL" />
              <Picker.Item label="Nivel Senior" value="SENIOR_LEVEL" />
            </Picker>
          </View>

          {/* Salary Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rango Salarial</Text>
            <Picker
              selectedValue={filters.salary || ''}
              onValueChange={(value) => setFilters({ ...filters, salary: value })}
              style={styles.picker}
            >
              <Picker.Item label="Cualquier salario" value="" />
              <Picker.Item label="0 - 10,000 BOB" value="0-10000" />
              <Picker.Item label="10,000 - 20,000 BOB" value="10000-20000" />
              <Picker.Item label="20,000 - 30,000 BOB" value="20000-30000" />
              <Picker.Item label="30,000+ BOB" value="30000+" />
            </Picker>
          </View>

          {/* Sort By Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ordenar Por</Text>
            <Picker
              selectedValue={filters.sortBy || 'newest'}
              onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
              style={styles.picker}
            >
              <Picker.Item label="Más Recientes" value="newest" />
              <Picker.Item label="Más Antiguos" value="oldest" />
              <Picker.Item label="Salario (Mayor a Menor)" value="salary_high" />
              <Picker.Item label="Salario (Menor a Mayor)" value="salary_low" />
              <Picker.Item label="Título A-Z" value="title" />
            </Picker>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  resetText: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Application Card Component

```typescript
// components/ApplicationCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Application } from '../services/jobsApi';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onPress }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      applied: '#3498db',
      reviewing: '#f39c12',
      shortlisted: '#27ae60',
      rejected: '#e74c3c',
      offered: '#9b59b6',
    };
    return colors[status as keyof typeof colors] || '#666';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      applied: 'Aplicado',
      reviewing: 'En Revisión',
      shortlisted: 'Preseleccionado',
      rejected: 'Rechazado',
      offered: 'Ofrecido',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#95a5a6',
      medium: '#f39c12',
      high: '#e74c3c',
    };
    return colors[priority as keyof typeof colors] || '#666';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.jobInfo}>
          {application.companyLogo && (
            <Image source={{ uri: application.companyLogo }} style={styles.companyLogo} />
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {application.jobTitle}
            </Text>
            <Text style={styles.companyName}>{application.company}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.location}>{application.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(application.status)}</Text>
          </View>
          {application.priority !== 'low' && (
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(application.priority) }]} />
          )}
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Aplicado hace {application.daysSinceApplied} días
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{application.jobType}</Text>
        </View>

        {application.salary && (
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {application.salary.min.toLocaleString()} - {application.salary.max.toLocaleString()} {application.salary.currency}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.skills}>
        {application.skills?.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {application.skills?.length > 3 && (
          <View style={styles.skillTag}>
            <Text style={styles.skillText}>+{application.skills.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.nextSteps} numberOfLines={2}>
          {application.nextSteps}
        </Text>

        {application.responseTime && (
          <Text style={styles.responseTime}>
            Respuesta en {application.responseTime} días
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#666',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  nextSteps: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18,
    marginBottom: 4,
  },
  responseTime: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
});
```

## 6. Screens

### Jobs List Screen

```typescript
// screens/JobsListScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useJobsStore } from '../stores/jobsStore';
import { JobCard } from '../components/JobCard';
import { JobFiltersModal } from '../components/JobFilters';
import { showMessage } from 'react-native-flash-message';

export const JobsListScreen = ({ navigation }) => {
  const {
    jobs,
    filters,
    loading,
    error,
    setFilters,
    fetchJobs,
    bookmarkJob,
    clearError
  } = useJobsStore();

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  useEffect(() => {
    if (error) {
      showMessage({
        message: 'Error',
        description: error,
        type: 'danger',
      });
      clearError();
    }
  }, [error, clearError]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
    fetchJobs();
  };

  const handleFiltersApply = (newFilters) => {
    setFilters(newFilters);
    fetchJobs();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const handleBookmark = async (jobId: string) => {
    try {
      await bookmarkJob(jobId);
      showMessage({
        message: 'Guardado',
        description: 'Trabajo actualizado en favoritos',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'No se pudo actualizar favoritos',
        type: 'danger',
      });
    }
  };

  const activeFiltersCount = useMemo(() => {
    return Object.keys(filters).filter(key =>
      filters[key as keyof typeof filters] &&
      filters[key as keyof typeof filters] !== ''
    ).length;
  }, [filters]);

  const renderJobCard = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
      onBookmark={() => handleBookmark(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="briefcase-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No se encontraron trabajos</Text>
      <Text style={styles.emptyDescription}>
        Intenta ajustar tus filtros de búsqueda o verifica tu conexión a internet.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar trabajos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setFilters({ ...filters, search: '' });
                fetchJobs();
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color={activeFiltersCount > 0 ? "#fff" : "#666"} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      {loading && jobs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando trabajos...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={jobs.length === 0 ? styles.emptyContainer : undefined}
        />
      )}

      {/* Filters Modal */}
      <JobFiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleFiltersApply}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

### Job Detail Screen

```typescript
// screens/JobDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useJobsStore } from '../stores/jobsStore';
import { showMessage } from 'react-native-flash-message';
import { formatDistanceToNow } from 'date-fns';

export const JobDetailScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const { selectedJob, loading, error, fetchJob, applyForJob, bookmarkJob, clearError } = useJobsStore();
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJob(jobId);
  }, [jobId, fetchJob]);

  useEffect(() => {
    if (error) {
      showMessage({
        message: 'Error',
        description: error,
        type: 'danger',
      });
      clearError();
    }
  }, [error, clearError]);

  const handleApply = () => {
    navigation.navigate('JobApplication', { jobId, jobTitle: selectedJob?.title });
  };

  const handleBookmark = async () => {
    if (!selectedJob) return;

    try {
      await bookmarkJob(selectedJob.id);
      showMessage({
        message: selectedJob.isBookmarked ? 'Removido de favoritos' : 'Agregado a favoritos',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'No se pudo actualizar favoritos',
        type: 'danger',
      });
    }
  };

  const handleShare = () => {
    // Implement share functionality
    showMessage({
      message: 'Compartir',
      description: 'Funcionalidad de compartir en desarrollo',
      type: 'info',
    });
  };

  const handleCompanyWebsite = () => {
    if (selectedJob?.company.website) {
      Linking.openURL(selectedJob.company.website);
    }
  };

  const renderSection = (title: string, content: string[] | string) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {Array.isArray(content) ? (
          content.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionContent}>{content}</Text>
        )}
      </View>
    );
  };

  if (loading || !selectedJob) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatSalary = () => {
    if (!selectedJob.salaryMin && !selectedJob.salaryMax) return null;

    const min = selectedJob.salaryMin ? `${selectedJob.salaryMin.toLocaleString()}` : '';
    const max = selectedJob.salaryMax ? `${selectedJob.salaryMax.toLocaleString()}` : '';
    const range = min && max ? `${min} - ${max}` : min || max;

    return `${range} ${selectedJob.salaryCurrency}`;
  };

  const getContractTypeLabel = (type: string) => {
    const labels = {
      'FULL_TIME': 'Tiempo Completo',
      'PART_TIME': 'Medio Tiempo',
      'INTERNSHIP': 'Pasantía',
      'VOLUNTEER': 'Voluntario',
      'FREELANCE': 'Freelance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels = {
      'NO_EXPERIENCE': 'Sin Experiencia',
      'ENTRY_LEVEL': 'Nivel Inicial',
      'MID_LEVEL': 'Nivel Intermedio',
      'SENIOR_LEVEL': 'Nivel Senior'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getWorkModalityLabel = (modality: string) => {
    const labels = {
      'REMOTE': 'Remoto',
      'HYBRID': 'Híbrido',
      'ONSITE': 'Presencial'
    };
    return labels[modality as keyof typeof labels] || modality;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleBookmark} style={styles.actionButton}>
            <Ionicons
              name={selectedJob.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={selectedJob.isBookmarked ? "#007AFF" : "#666"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View style={styles.companySection}>
            {selectedJob.company.logo && (
              <Image source={{ uri: selectedJob.company.logo }} style={styles.companyLogo} />
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.jobTitle}>{selectedJob.title}</Text>
              <TouchableOpacity onPress={handleCompanyWebsite} disabled={!selectedJob.company.website}>
                <Text style={[styles.companyName, selectedJob.company.website && styles.companyLink]}>
                  {selectedJob.company.name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.jobMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.metaText}>{selectedJob.location}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.metaText}>{getContractTypeLabel(selectedJob.contractType)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="school-outline" size={18} color="#666" />
              <Text style={styles.metaText}>{getExperienceLevelLabel(selectedJob.experienceLevel)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="desktop-outline" size={18} color="#666" />
              <Text style={styles.metaText}>{getWorkModalityLabel(selectedJob.workModality)}</Text>
            </View>
            {formatSalary() && (
              <View style={styles.metaRow}>
                <Ionicons name="card-outline" size={18} color="#666" />
                <Text style={styles.metaText}>{formatSalary()}</Text>
              </View>
            )}
          </View>

          <View style={styles.badges}>
            {selectedJob.urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>Urgente</Text>
              </View>
            )}
            {selectedJob.featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>Destacado</Text>
              </View>
            )}
          </View>

          <View style={styles.stats}>
            <Text style={styles.statsText}>
              {selectedJob.viewsCount} vistas • {selectedJob.applicationsCount} aplicaciones
            </Text>
            <Text style={styles.postedTime}>
              Publicado {formatDistanceToNow(new Date(selectedJob.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </View>

        {/* Job Description */}
        {renderSection('Descripción del Trabajo', selectedJob.description)}

        {/* Requirements */}
        {renderSection('Requisitos', selectedJob.requirements)}

        {/* Benefits */}
        {renderSection('Beneficios', selectedJob.benefits)}

        {/* Skills Required */}
        {selectedJob.skillsRequired.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades Requeridas</Text>
            <View style={styles.skillsContainer}>
              {selectedJob.skillsRequired.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Desired Skills */}
        {selectedJob.desiredSkills && selectedJob.desiredSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades Deseadas</Text>
            <View style={styles.skillsContainer}>
              {selectedJob.desiredSkills.map((skill, index) => (
                <View key={index} style={[styles.skillTag, styles.desiredSkillTag]}>
                  <Text style={[styles.skillText, styles.desiredSkillText]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Application Deadline */}
        {selectedJob.applicationDeadline && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fecha Límite</Text>
            <View style={styles.deadlineContainer}>
              <Ionicons name="calendar-outline" size={18} color="#e74c3c" />
              <Text style={styles.deadlineText}>
                {new Date(selectedJob.applicationDeadline).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre la Empresa</Text>
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{selectedJob.company.name}</Text>
            {selectedJob.company.description && (
              <Text style={styles.companyDescription}>{selectedJob.company.description}</Text>
            )}
            <View style={styles.companyMeta}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.companyMetaText}>{selectedJob.company.location}</Text>
            </View>
            {selectedJob.company.website && (
              <TouchableOpacity onPress={handleCompanyWebsite} style={styles.companyMeta}>
                <Ionicons name="globe-outline" size={16} color="#007AFF" />
                <Text style={[styles.companyMetaText, styles.websiteLink]}>
                  {selectedJob.company.website}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Apply Button */}
      {!selectedJob.isApplied && (
        <View style={styles.applyContainer}>
          <TouchableOpacity
            style={[styles.applyButton, applying && styles.applyButtonDisabled]}
            onPress={handleApply}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.applyButtonText}>Aplicar a este Trabajo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {selectedJob.isApplied && (
        <View style={styles.appliedContainer}>
          <View style={styles.appliedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
            <Text style={styles.appliedText}>Ya aplicaste a este trabajo</Text>
          </View>
          <TouchableOpacity
            style={styles.viewApplicationButton}
            onPress={() => navigation.navigate('Applications')}
          >
            <Text style={styles.viewApplicationText}>Ver mis aplicaciones</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  jobHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  companySection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 28,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#666',
  },
  companyLink: {
    color: '#007AFF',
  },
  jobMeta: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  badges: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  urgentBadge: {
    backgroundColor: '#ffe8e8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  urgentText: {
    fontSize: 12,
    color: '#d63031',
    fontWeight: '600',
  },
  featuredBadge: {
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  stats: {
    marginTop: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  postedTime: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
    marginTop: 1,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  desiredSkillTag: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  desiredSkillText: {
    color: '#666',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5e7',
    padding: 12,
    borderRadius: 8,
  },
  deadlineText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
    marginLeft: 8,
  },
  companyDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  companyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  companyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  companyMetaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  websiteLink: {
    color: '#007AFF',
  },
  bottomPadding: {
    height: 100,
  },
  applyContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appliedContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  appliedText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  viewApplicationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  viewApplicationText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
```

### Job Application Screen

```typescript
// screens/JobApplicationScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useJobsStore } from '../stores/jobsStore';
import { showMessage } from 'react-native-flash-message';

export const JobApplicationScreen = ({ route, navigation }) => {
  const { jobId, jobTitle } = route.params;
  const { applyForJob } = useJobsStore();

  const [coverLetter, setCoverLetter] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [applying, setApplying] = useState(false);

  const coverLetterRef = useRef(null);

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setAttachments(prev => [...prev, file]);
        showMessage({
          message: 'Archivo adjuntado',
          description: file.name,
          type: 'success',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'No se pudo adjuntar el archivo',
        type: 'danger',
      });
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      showMessage({
        message: 'Campo requerido',
        description: 'Por favor escribe una carta de presentación',
        type: 'warning',
      });
      coverLetterRef.current?.focus();
      return;
    }

    Alert.alert(
      'Confirmar Aplicación',
      '¿Estás seguro de que quieres aplicar a este trabajo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aplicar', onPress: submitApplication },
      ]
    );
  };

  const submitApplication = async () => {
    setApplying(true);

    try {
      await applyForJob(jobId, coverLetter);

      showMessage({
        message: 'Aplicación enviada',
        description: '¡Tu aplicación ha sido enviada exitosamente!',
        type: 'success',
      });

      navigation.navigate('Applications');
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'No se pudo enviar la aplicación. Intenta de nuevo.',
        type: 'danger',
      });
    } finally {
      setApplying(false);
    }
  };

  const renderAttachment = (file, index) => (
    <View key={index} style={styles.attachmentItem}>
      <View style={styles.attachmentInfo}>
        <Ionicons name="document-text-outline" size={24} color="#007AFF" />
        <View style={styles.attachmentText}>
          <Text style={styles.attachmentName} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles.attachmentSize}>
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveAttachment(index)}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={24} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aplicar al Trabajo</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Job Info */}
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {jobTitle}
            </Text>
            <Text style={styles.applicationNote}>
              Completa los siguientes campos para aplicar a este trabajo
            </Text>
          </View>

          {/* Cover Letter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Carta de Presentación <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.sectionDescription}>
              Explica por qué eres el candidato ideal para este trabajo
            </Text>
            <TextInput
              ref={coverLetterRef}
              style={styles.textArea}
              placeholder="Querido equipo de contratación,

Me dirijo a ustedes para expresar mi interés en la posición de...

Considero que mi experiencia en... me convierte en un candidato ideal porque...

Agradezco la oportunidad de ser considerado y espero poder discutir cómo puedo contribuir al éxito de su equipo.

Atentamente,
[Tu nombre]"
              value={coverLetter}
              onChangeText={setCoverLetter}
              multiline
              numberOfLines={12}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.characterCount}>
              {coverLetter.length}/2000 caracteres
            </Text>
          </View>

          {/* Attachments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Archivos Adjuntos</Text>
            <Text style={styles.sectionDescription}>
              Adjunta tu CV, portafolio u otros documentos relevantes (PDF, DOC, DOCX)
            </Text>

            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((file, index) => renderAttachment(file, index))}
              </View>
            )}

            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleDocumentPicker}
            >
              <Ionicons name="attach-outline" size={20} color="#007AFF" />
              <Text style={styles.attachButtonText}>Adjuntar Archivo</Text>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consejos para una Buena Aplicación</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#27ae60" />
                <Text style={styles.tipText}>
                  Personaliza tu carta de presentación para este trabajo específico
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#27ae60" />
                <Text style={styles.tipText}>
                  Resalta tu experiencia relevante y logros específicos
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#27ae60" />
                <Text style={styles.tipText}>
                  Menciona por qué te interesa trabajar en esta empresa
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#27ae60" />
                <Text style={styles.tipText}>
                  Revisa tu ortografía y gramática antes de enviar
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, applying && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={applying}
          >
            <Text style={styles.submitButtonText}>
              {applying ? 'Enviando...' : 'Enviar Aplicación'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  jobInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  applicationNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  required: {
    color: '#ff3b30',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  attachmentsList: {
    marginBottom: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentText: {
    marginLeft: 12,
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  attachButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 10,
  },
  bottomPadding: {
    height: 20,
  },
  submitContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## 7. Navigation

```typescript
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Jobs Screens
import { JobsListScreen } from '../screens/JobsListScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { JobApplicationScreen } from '../screens/JobApplicationScreen';

// Applications Screens
import { ApplicationsScreen } from '../screens/ApplicationsScreen';
import { ApplicationDetailScreen } from '../screens/ApplicationDetailScreen';

// Profile Screens
import { ProfileScreen } from '../screens/ProfileScreen';

// Other Screens
import { BookmarkedJobsScreen } from '../screens/BookmarkedJobsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const JobsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="JobsList" component={JobsListScreen} />
    <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    <Stack.Screen name="JobApplication" component={JobApplicationScreen} />
  </Stack.Navigator>
);

const ApplicationsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ApplicationsList" component={ApplicationsScreen} />
    <Stack.Screen name="ApplicationDetail" component={ApplicationDetailScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Jobs') {
          iconName = focused ? 'briefcase' : 'briefcase-outline';
        } else if (route.name === 'Applications') {
          iconName = focused ? 'documents' : 'documents-outline';
        } else if (route.name === 'Bookmarks') {
          iconName = focused ? 'bookmark' : 'bookmark-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen
      name="Jobs"
      component={JobsStackNavigator}
      options={{ title: 'Trabajos' }}
    />
    <Tab.Screen
      name="Applications"
      component={ApplicationsStackNavigator}
      options={{ title: 'Mis Aplicaciones' }}
    />
    <Tab.Screen
      name="Bookmarks"
      component={BookmarkedJobsScreen}
      options={{ title: 'Favoritos' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Perfil' }}
    />
  </Tab.Navigator>
);

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export const AppNavigator = ({ isAuthenticated }) => {
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
```

## 8. File Structure

```
cemse-jobs-mobile/
├── app.json
├── package.json
├── App.tsx
├── babel.config.js
├── metro.config.js
├── src/
│   ├── components/
│   │   ├── JobCard.tsx
│   │   ├── JobFilters.tsx
│   │   ├── ApplicationCard.tsx
│   │   ├── ApplicationTimeline.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── SkeletonLoader.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── jobs/
│   │   │   ├── JobsListScreen.tsx
│   │   │   ├── JobDetailScreen.tsx
│   │   │   ├── JobApplicationScreen.tsx
│   │   │   └── BookmarkedJobsScreen.tsx
│   │   ├── applications/
│   │   │   ├── ApplicationsScreen.tsx
│   │   │   └── ApplicationDetailScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── jobsApi.ts
│   │   └── storage.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── jobsStore.ts
│   │   └── applicationsStore.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useJobs.ts
│   │   └── useApplications.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── navigation.ts
│   │   └── index.ts
│   └── styles/
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── __tests__/
    ├── components/
    ├── screens/
    ├── services/
    └── utils/
```

## 9. Testing Strategy

### Unit Tests

```typescript
// __tests__/services/jobsApi.test.ts
import { JobsApiService } from '../../src/services/jobsApi';
import { api } from '../../src/services/api';

jest.mock('../../src/services/api');

describe('JobsApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getJobs', () => {
    it('should fetch jobs successfully', async () => {
      const mockJobs = [
        { id: '1', title: 'Developer', company: { name: 'Tech Corp' } },
      ];

      (api.get as jest.Mock).mockResolvedValueOnce({
        data: { jobs: mockJobs, success: true }
      });

      const result = await JobsApiService.getJobs();

      expect(api.get).toHaveBeenCalledWith('/jobs?');
      expect(result.jobs).toEqual(mockJobs);
      expect(result.success).toBe(true);
    });

    it('should handle API errors', async () => {
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(JobsApiService.getJobs()).rejects.toThrow('Network error');
    });
  });

  describe('applyForJob', () => {
    it('should apply for job successfully', async () => {
      const mockApplication = { id: '1', jobId: 'job-1', status: 'applied' };

      (api.post as jest.Mock).mockResolvedValueOnce({
        data: { application: mockApplication, success: true }
      });

      const result = await JobsApiService.applyForJob('job-1', 'Cover letter');

      expect(api.post).toHaveBeenCalledWith('/applications', {
        jobId: 'job-1',
        coverLetter: 'Cover letter'
      });
      expect(result.application).toEqual(mockApplication);
    });
  });
});
```

### Component Tests

```typescript
// __tests__/components/JobCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { JobCard } from '../../src/components/JobCard';

const mockJob = {
  id: '1',
  title: 'Software Developer',
  company: {
    id: '1',
    name: 'Tech Corp',
    logo: 'https://example.com/logo.png',
    location: 'Cochabamba'
  },
  location: 'Cochabamba',
  contractType: 'FULL_TIME',
  experienceLevel: 'ENTRY_LEVEL',
  skillsRequired: ['JavaScript', 'React'],
  salaryMin: 5000,
  salaryMax: 8000,
  salaryCurrency: 'BOB',
  createdAt: '2023-01-01T00:00:00Z',
  isApplied: false,
  isBookmarked: false,
  viewsCount: 10,
  applicationsCount: 5,
  featured: false,
  urgent: false
};

describe('JobCard', () => {
  it('renders job information correctly', () => {
    const onPress = jest.fn();
    const onBookmark = jest.fn();

    const { getByText } = render(
      <JobCard job={mockJob} onPress={onPress} onBookmark={onBookmark} />
    );

    expect(getByText('Software Developer')).toBeTruthy();
    expect(getByText('Tech Corp')).toBeTruthy();
    expect(getByText('Cochabamba')).toBeTruthy();
    expect(getByText('5,000 - 8,000 BOB')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const onBookmark = jest.fn();

    const { getByText } = render(
      <JobCard job={mockJob} onPress={onPress} onBookmark={onBookmark} />
    );

    fireEvent.press(getByText('Software Developer'));
    expect(onPress).toHaveBeenCalled();
  });

  it('calls onBookmark when bookmark button is pressed', () => {
    const onPress = jest.fn();
    const onBookmark = jest.fn();

    const { getByTestId } = render(
      <JobCard job={mockJob} onPress={onPress} onBookmark={onBookmark} />
    );

    // You'd need to add testID="bookmark-button" to the TouchableOpacity
    fireEvent.press(getByTestId('bookmark-button'));
    expect(onBookmark).toHaveBeenCalled();
  });
});
```

### E2E Tests (Detox)

```typescript
// e2e/jobs.e2e.js
describe('Jobs Module', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display jobs list', async () => {
    await expect(element(by.text('Trabajos'))).toBeVisible();
    await expect(element(by.id('jobs-list'))).toBeVisible();
  });

  it('should allow searching for jobs', async () => {
    await element(by.id('search-input')).typeText('developer');
    await element(by.id('search-input')).tapReturnKey();

    await waitFor(element(by.text('Software Developer')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to job details', async () => {
    await element(by.text('Software Developer')).tap();
    await expect(element(by.text('Descripción del Trabajo'))).toBeVisible();
  });

  it('should apply for a job', async () => {
    await element(by.text('Software Developer')).tap();
    await element(by.text('Aplicar a este Trabajo')).tap();

    await element(by.id('cover-letter-input')).typeText('I am interested in this position...');
    await element(by.text('Enviar Aplicación')).tap();

    await expect(element(by.text('Aplicación enviada'))).toBeVisible();
  });
});
```

## 10. Performance Optimization

### Lazy Loading and Code Splitting

```typescript
// components/LazyJobCard.tsx
import React, { lazy, Suspense } from 'react';
import { SkeletonLoader } from './SkeletonLoader';

const JobCard = lazy(() => import('./JobCard'));

export const LazyJobCard = (props) => (
  <Suspense fallback={<SkeletonLoader />}>
    <JobCard {...props} />
  </Suspense>
);
```

### Image Optimization

```typescript
// components/OptimizedImage.tsx
import React, { useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';

interface OptimizedImageProps {
  source: { uri: string };
  style: any;
  placeholder?: React.ReactNode;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={style}>
      <Image
        source={source}
        style={style}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        resizeMode="cover"
      />
      {loading && (
        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator color="#007AFF" />
        </View>
      )}
    </View>
  );
};
```

### Infinite Scroll Implementation

```typescript
// hooks/useInfiniteJobs.ts
import { useState, useEffect, useCallback } from 'react';
import { JobsApiService } from '../services/jobsApi';

export const useInfiniteJobs = (filters) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadJobs = useCallback(async (pageNum = 1, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await JobsApiService.getJobs({
        ...filters,
        page: pageNum,
        limit: 20
      });

      if (reset) {
        setJobs(response.jobs);
      } else {
        setJobs(prev => [...prev, ...response.jobs]);
      }

      setHasMore(response.jobs.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, loading]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadJobs(page + 1, false);
    }
  }, [hasMore, loading, page, loadJobs]);

  const refresh = useCallback(() => {
    loadJobs(1, true);
  }, [loadJobs]);

  useEffect(() => {
    refresh();
  }, [filters]);

  return {
    jobs,
    loading,
    hasMore,
    loadMore,
    refresh
  };
};
```

## Conclusion

This comprehensive guide provides all the necessary components, services, and patterns to implement the CEMSE Jobs and Youth Applications module in React Native with Expo. The implementation follows modern React Native best practices including:

- **Modern State Management** with Zustand
- **Type Safety** with TypeScript
- **Performance Optimization** with lazy loading and infinite scroll
- **Comprehensive Testing** with unit, integration, and E2E tests
- **Clean Architecture** with separated concerns
- **User Experience** focused design with proper loading states and error handling

The modular structure allows for easy maintenance and scaling, while the comprehensive test coverage ensures reliability across different scenarios. The implementation replicates all the functionality from the web version while taking advantage of native mobile capabilities like document picking, secure storage, and optimized navigation patterns.

## Test Integration and Asset Requirements

Based on the test file created (`tests/jobs/jobs-module.test.js`), the following assets may be needed:

1. **PDF Files** (`tests/jobs/assets/pdf/`):
   - test-cv.pdf (created)
   - portfolio.pdf
   - certificates.pdf

2. **Image Files** (`tests/jobs/assets/images/`):
   - profile-photo.png (created)
   - company-logo.png
   - portfolio-images/

The test suite covers all major functionalities and can be easily adapted for mobile testing by replacing HTTP requests with React Native API calls and using React Native Testing Library for component testing.

Remember to update the API endpoints in the mobile version to match your backend configuration and add proper error handling for network connectivity issues common in mobile environments.