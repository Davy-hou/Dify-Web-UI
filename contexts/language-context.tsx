'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'zh' | 'en'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  zh: {
    'Welcome': '欢迎',
    'Log In': '登录',
    'Register': '注册',
    'Email': '邮箱',
    'Password': '密码',
    'Name': '姓名',
    "Don't have an account?": '还没有账户？',
    'Already have an account?': '已经有账户了？',
    'Logged in successfully': '登录成功',
    'Failed to log in': '登录失败',
    'Registered successfully': '注册成功',
    'Failed to register': '注册失败',
    'Log out': '退出登录',
    'Type your message...': '输入您的消息...',
    'Send message': '发送消息',
    'Selected file:': '已选择文件：',
    'Upload file': '上传文件',
    'Start voice input': '开始语音输入',
    'Stop voice input': '停止语音输入',
    'New Chat': '新对话',
    'Chat History': '聊天历史',
    'Search the docs...': '搜索文档...',
    'File size exceeds 5MB limit': '文件大小超过5MB限制',
    'File uploaded successfully': '文件上传成功',
    'Speech recognition error:': '语音识别错误：',
    'Speech recognition is not supported in this browser': '此浏览器不支持语音识别',
    // Settings Dialog
    'Settings': '设置',
    'Appearance': '外观',
    'Language': '语言',
    'API Settings': 'API 设置',
    'App Settings': '应用设置',
    'Theme': '主题',
    'Select your preferred theme': '选择您喜欢的主题',
    'Light': '浅色',
    'Dark': '深色',
    'Display Language': '显示语言',
    'Select the language for the interface': '选择界面语言',
    'API Key': 'API 密钥',
    'Enter your API key': '输入您的 API 密钥',
    'Your API key will be stored securely': '您的 API 密钥将被安全存储',
    'Save API Key': '保存 API 密钥',
    // API Provider
    'Select API Provider': '选择 API 服务商',
    'Enter your Dify API token': '输入您的 Dify API 令牌',
    'Enter your Coze API token': '输入您的 Coze API 令牌',
    'API key saved successfully': 'API 密钥保存成功',
    'Failed to save API key': 'API 密钥保存失败',
    'Saving...': '保存中...',
    'Show API Key': '显示 API 密钥',
    'Hide API Key': '隐藏 API 密钥',
    'Current API Key': '当前 API 密钥',
    // App Settings
    'Add New App': '添加新应用',
    'Enter app name': '输入应用名称',
    'Enter API token': '输入 API 令牌',
    'Show API Token': '显示 API 令牌',
    'Hide API Token': '隐藏 API 令牌',
    'Adding...': '添加中...',
    'Add App': '添加应用',
    'Your Apps': '您的应用',
    'No apps added yet': '暂无应用',
    'Failed to add app': '应用添加失败',
    'Delete App': '删除应用',
    'App deleted successfully': '应用删除成功',
    'Failed to delete app': '应用删除失败',
    'Manage your apps': '管理您的应用',
    'Previous': '上一页',
    'Next': '下一页',
    'Total': '总计',
    // App Selector
    'App': '应用',
    'Select App': '选择应用',
    'Default': '默认',
    'Use system default': '使用系统默认',
    'No apps configured': '未配置应用',
    'Add Your First App': '添加您的第一个应用',
    'Cancel': '取消',
    'App Name': '应用名称',
    'API Provider': 'API 服务商',
    'API Token': 'API 令牌',
    'Created': '创建时间',
    'Loading...': '加载中...',
    'Configure an app to start chatting': '配置应用以开始聊天'
  },
  en: {
    'Welcome': 'Welcome',
    'Log In': 'Log In',
    'Register': 'Register',
    'Email': 'Email',
    'Password': 'Password',
    'Name': 'Name',
    "Don't have an account?": "Don't have an account?",
    'Already have an account?': 'Already have an account?',
    'Logged in successfully': 'Logged in successfully',
    'Failed to log in': 'Failed to log in',
    'Registered successfully': 'Registered successfully',
    'Failed to register': 'Failed to register',
    'Log out': 'Log out',
    'Type your message...': 'Type your message...',
    'Send message': 'Send message',
    'Selected file:': 'Selected file:',
    'Upload file': 'Upload file',
    'Start voice input': 'Start voice input',
    'Stop voice input': 'Stop voice input',
    'New Chat': 'New Chat',
    'Chat History': 'Chat History',
    'Search the docs...': 'Search the docs...',
    'File size exceeds 5MB limit': 'File size exceeds 5MB limit',
    'File uploaded successfully': 'File uploaded successfully',
    'Speech recognition error:': 'Speech recognition error:',
    'Speech recognition is not supported in this browser': 'Speech recognition is not supported in this browser',
    // Settings Dialog
    'Settings': 'Settings',
    'Appearance': 'Appearance',
    'Language': 'Language',
    'API Settings': 'API Settings',
    'App Settings': 'App Settings',
    'Theme': 'Theme',
    'Select your preferred theme': 'Select your preferred theme',
    'Light': 'Light',
    'Dark': 'Dark',
    'Display Language': 'Display Language',
    'Select the language for the interface': 'Select the language for the interface',
    'API Key': 'API Key',
    'Enter your API key': 'Enter your API key',
    'Your API key will be stored securely': 'Your API key will be stored securely',
    'Save API Key': 'Save API Key',
    // API Provider
    'Select API Provider': 'Select API Provider',
    'Enter your Dify API token': 'Enter your Dify API token',
    'Enter your Coze API token': 'Enter your Coze API token',
    'API key saved successfully': 'API key saved successfully',
    'Failed to save API key': 'Failed to save API key',
    'Saving...': 'Saving...',
    'Show API Key': 'Show API Key',
    'Hide API Key': 'Hide API Key',
    'Current API Key': 'Current API Key',
    // App Settings
    'Add New App': 'Add New App',
    'Enter app name': 'Enter app name',
    'Enter API token': 'Enter API token',
    'Show API Token': 'Show API Token',
    'Hide API Token': 'Hide API Token',
    'Adding...': 'Adding...',
    'Add App': 'Add App',
    'Your Apps': 'Your Apps',
    'No apps added yet': 'No apps added yet',
    'Failed to add app': 'Failed to add app',
    'Delete App': 'Delete App',
    'App deleted successfully': 'App deleted successfully',
    'Failed to delete app': 'Failed to delete app',
    'Manage your apps': 'Manage your apps',
    'Previous': 'Previous',
    'Next': 'Next',
    'Total': 'Total',
    // App Selector
    'App': 'App',
    'Select App': 'Select App',
    'Default': 'Default',
    'Use system default': 'Use system default',
    'No apps configured': 'No apps configured',
    'Add Your First App': 'Add Your First App',
    'Cancel': 'Cancel',
    'App Name': 'App Name',
    'API Provider': 'API Provider',
    'API Token': 'API Token',
    'Created': 'Created',
    'Loading...': 'Loading...',
    'Configure an app to start chatting': 'Configure an app to start chatting'
  },
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh')

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
