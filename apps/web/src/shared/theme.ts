import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';

const baseTokens = {
  colorPrimary: '#7C6AEF',
  colorLink: '#7C6AEF',
  colorSuccess: '#34D399',
  colorWarning: '#FCD34D',
  colorError: '#FB7185',
  colorInfo: '#60A5FA',

  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontSize: 14,
  fontSizeHeading1: 32,
  fontSizeHeading2: 24,
  fontSizeHeading3: 20,

  borderRadius: 8,
  borderRadiusLG: 12,

  motionDurationSlow: '0.25s',
  motionDurationMid: '0.15s',
  motionDurationFast: '0.1s',
};

export const communeTheme: ThemeConfig = {
  token: {
    ...baseTokens,
    colorBgBase: '#0E0E16',
    colorBgContainer: '#18182A',
    colorBgElevated: '#1E1E34',
    colorBgLayout: '#0E0E16',
    colorBorder: 'rgba(255, 255, 255, 0.06)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.04)',
    colorText: '#CBCBD7',
    colorTextSecondary: '#8E8EA0',
    colorTextTertiary: '#626273',
    colorTextQuaternary: '#3F3F50',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  components: {
    Layout: { headerBg: 'transparent', bodyBg: 'transparent', siderBg: 'transparent' },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(124, 106, 239, 0.12)',
      darkItemHoverBg: 'rgba(124, 106, 239, 0.06)',
    },
    Card: {
      colorBgContainer: '#18182A',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.04)',
    },
    Button: { primaryShadow: 'none' },
    Input: {
      colorBgContainer: 'rgba(255,255,255,0.03)',
      colorBorder: 'rgba(255,255,255,0.06)',
      activeBorderColor: '#7C6AEF',
    },
    Table: {
      headerBg: '#18182A',
      rowHoverBg: 'rgba(124, 106, 239, 0.05)',
    },
    Tag: {
      defaultBg: 'rgba(124, 106, 239, 0.1)',
      defaultColor: '#9B8AFB',
    },
  },
  algorithm: antdTheme.darkAlgorithm,
};

export const communeThemeLight: ThemeConfig = {
  token: {
    ...baseTokens,
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F5F5FA',
    colorBorder: 'rgba(0, 0, 0, 0.07)',
    colorBorderSecondary: 'rgba(0, 0, 0, 0.04)',
    colorText: '#2D2D44',
    colorTextSecondary: '#6B6B80',
    colorTextTertiary: '#9E9EB0',
    colorTextQuaternary: '#D0D0DD',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  components: {
    Layout: { headerBg: 'transparent', bodyBg: 'transparent', siderBg: 'transparent' },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(108, 92, 231, 0.08)',
      itemHoverBg: 'rgba(108, 92, 231, 0.04)',
      itemSelectedColor: '#6C5CE7',
      itemColor: '#4B5563',
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      colorBorderSecondary: 'rgba(0, 0, 0, 0.06)',
    },
    Button: { primaryShadow: 'none' },
    Input: {
      colorBgContainer: '#F9FAFB',
      colorBorder: 'rgba(0, 0, 0, 0.1)',
      activeBorderColor: '#7C6AEF',
    },
    Table: {
      headerBg: '#F9FAFB',
      rowHoverBg: 'rgba(108, 92, 231, 0.04)',
    },
    Tag: {
      defaultBg: 'rgba(108, 92, 231, 0.06)',
      defaultColor: '#6C5CE7',
    },
  },
  algorithm: antdTheme.defaultAlgorithm,
};
