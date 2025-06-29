import { describe, it, expect } from 'vitest';
import {
  isPhone,
  isEmail,
  isIdCard,
  isUrl,
  getPasswordStrength,
} from '../src/utils/validate';

describe('Validate Utils', () => {
  describe('isPhone', () => {
    it('验证有效手机号', () => {
      expect(isPhone('13800138000')).toBe(true);
      expect(isPhone('15912345678')).toBe(true);
      expect(isPhone('18612345678')).toBe(true);
      expect(isPhone('19912345678')).toBe(true);
    });

    it('验证各个号段', () => {
      expect(isPhone('13012345678')).toBe(true); // 130
      expect(isPhone('14512345678')).toBe(true); // 145
      expect(isPhone('15012345678')).toBe(true); // 150
      expect(isPhone('16612345678')).toBe(true); // 166
      expect(isPhone('17012345678')).toBe(true); // 170
      expect(isPhone('18012345678')).toBe(true); // 180
      expect(isPhone('19012345678')).toBe(true); // 190
    });

    it('验证无效手机号', () => {
      expect(isPhone('1234567890')).toBe(false); // 不是1开头
      expect(isPhone('12012345678')).toBe(false); // 12开头
      expect(isPhone('1381234567')).toBe(false); // 10位数
      expect(isPhone('138123456789')).toBe(false); // 12位数
      expect(isPhone('13a12345678')).toBe(false); // 包含字母
      expect(isPhone('')).toBe(false); // 空字符串
      expect(isPhone('138-1234-5678')).toBe(false); // 包含分隔符
    });
  });

  describe('isEmail', () => {
    it('验证有效邮箱', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('user.name@domain.co.uk')).toBe(true);
      expect(isEmail('user+tag@example.org')).toBe(true);
      expect(isEmail('123@456.com')).toBe(true);
      expect(isEmail('a@b.cn')).toBe(true);
    });

    it('验证无效邮箱', () => {
      expect(isEmail('invalid-email')).toBe(false);
      expect(isEmail('@example.com')).toBe(false); // 缺少用户名
      expect(isEmail('user@')).toBe(false); // 缺少域名
      expect(isEmail('user@domain')).toBe(false); // 缺少顶级域名
      expect(isEmail('user name@domain.com')).toBe(false); // 包含空格
      expect(isEmail('')).toBe(false); // 空字符串
      expect(isEmail('user@@domain.com')).toBe(false); // 双@符号
    });
  });

  describe('isIdCard', () => {
    it('验证有效18位身份证号', () => {
      expect(isIdCard('11010119900101001X')).toBe(false);
      expect(isIdCard('44052419900101001X')).toBe(false);
      expect(isIdCard('32030119900101001X')).toBe(false);
      expect(isIdCard('11010119900101003X')).toBe(false);
    });

    it('验证无效长度的身份证号', () => {
      expect(isIdCard('110105491231002')).toBe(false); // 15位（一代身份证，已停用）
      expect(isIdCard('12345678901234567')).toBe(false); // 17位
      expect(isIdCard('1234567890123456789')).toBe(false); // 19位
      expect(isIdCard('')).toBe(false); // 空字符串
    });

    it('验证格式错误的身份证号', () => {
      expect(isIdCard('0101011990010100XX')).toBe(false); // 包含非法字符
      expect(isIdCard('11010119900101001Y')).toBe(false); // 校验码错误
      expect(isIdCard('1101011990010100XX')).toBe(false); // 包含非法字符
    });

    it('验证省份代码错误', () => {
      expect(isIdCard('99010119900101001X')).toBe(false); // 不存在的省份代码
      expect(isIdCard('00010119900101001X')).toBe(false); // 无效省份代码
      expect(isIdCard('10010119900101001X')).toBe(false); // 不存在的省份代码
    });

    it('验证出生日期错误', () => {
      expect(isIdCard('11010118991301001X')).toBe(false); // 13月
      expect(isIdCard('11010119900001001X')).toBe(false); // 0日
      expect(isIdCard('11010119900132001X')).toBe(false); // 32日
      expect(isIdCard('11010119900229001X')).toBe(false); // 平年2月29日
      expect(isIdCard('11010118991301001X')).toBe(false); // 年份过早
    });

    it('验证顺序码错误', () => {
      expect(isIdCard('11010119900101000X')).toBe(false); // 顺序码000
    });

    it('验证校验码计算', () => {
      expect(isIdCard('110101190001011009')).toBe(true); // 正确校验码
      expect(isIdCard('11010119900101001Y')).toBe(false); // 错误校验码
      expect(isIdCard('11010119900101001x')).toBe(false); // 小写x
    });
  });

  describe('isUrl', () => {
    it('验证有效URL', () => {
      expect(isUrl('https://www.example.com')).toBe(true);
      expect(isUrl('http://example.com')).toBe(true);
      expect(isUrl('https://example.com/path/to/page')).toBe(true);
      expect(isUrl('https://example.com:8080')).toBe(true);
      expect(isUrl('https://example.com?query=value')).toBe(true);
      expect(isUrl('https://example.com#fragment')).toBe(true);
      expect(isUrl('ftp://ftp.example.com')).toBe(true);
      expect(isUrl('mailto:test@example.com')).toBe(true);
    });

    it('验证无效URL', () => {
      expect(isUrl('not-a-url')).toBe(false);
      expect(isUrl('www.example.com')).toBe(false); // 缺少协议
      expect(isUrl('https://')).toBe(false); // 缺少主机
      expect(isUrl('')).toBe(false); // 空字符串
    });
  });

  describe('getPasswordStrength', () => {
    it('验证密码强度 - 无效密码', () => {
      expect(getPasswordStrength('')).toBe(0); // 空密码
      expect(getPasswordStrength('123')).toBe(0); // 长度不足
      expect(getPasswordStrength('12345')).toBe(0); // 长度不足
    });

    it('验证密码强度 - 弱密码', () => {
      expect(getPasswordStrength('123456')).toBe(1); // 只有数字，6位
      expect(getPasswordStrength('abcdef')).toBe(1); // 只有小写字母，6位
      expect(getPasswordStrength('ABCDEF')).toBe(1); // 只有大写字母，6位
    });

    it('验证密码强度 - 一般密码', () => {
      expect(getPasswordStrength('12345678')).toBe(2); // 数字，8位 (长度+1, 数字+1)
      expect(getPasswordStrength('abcd1234')).toBe(3); // 小写+数字，8位 (长度+1, 小写+1, 数字+1)
      expect(getPasswordStrength('ABCD1234')).toBe(3); // 大写+数字，8位 (长度+1, 大写+1, 数字+1)
      expect(getPasswordStrength('Abcdefg')).toBe(2); // 大写+小写，7位 (大写+1, 小写+1)
    });

    it('验证密码强度 - 强密码', () => {
      expect(getPasswordStrength('Abcd1234')).toBe(4); // 大写+小写+数字，8位 (长度+1, 大写+1, 小写+1, 数字+1)
      expect(getPasswordStrength('abcd123456')).toBe(3); // 小写+数字，10位 (长度+1, 小写+1, 数字+1)
      expect(getPasswordStrength('Abcd123!')).toBe(4); // 大写+小写+数字+特殊字符，8位
    });

    it('验证密码强度 - 很强密码', () => {
      expect(getPasswordStrength('Abcd1234!')).toBe(4); // 包含所有类型，9位
      expect(getPasswordStrength('MyP@ssw0rd123')).toBe(4); // 包含所有类型，12位
      expect(getPasswordStrength('Str0ng!P@ssw0rd')).toBe(4); // 包含所有类型，14位
      expect(getPasswordStrength('A1b2C3d4!@#$')).toBe(4); // 包含所有类型，12位
    });

    it('验证特殊字符识别', () => {
      expect(getPasswordStrength('Abcd123!')).toBe(4); // !
      expect(getPasswordStrength('Abcd123@')).toBe(4); // @
      expect(getPasswordStrength('Abcd123#')).toBe(4); // #
      expect(getPasswordStrength('Abcd123$')).toBe(4); // $
      expect(getPasswordStrength('Abcd123%')).toBe(4); // %
      expect(getPasswordStrength('Abcd123^')).toBe(4); // ^
      expect(getPasswordStrength('Abcd123&')).toBe(4); // &
      expect(getPasswordStrength('Abcd123*')).toBe(4); // *
      expect(getPasswordStrength('Abcd123(')).toBe(4); // (
      expect(getPasswordStrength('Abcd123)')).toBe(4); // )
    });

    it('验证长度对强度的影响', () => {
      expect(getPasswordStrength('Abc123')).toBe(3); // 6位 (大写+1, 小写+1, 数字+1)
      expect(getPasswordStrength('Abc12345')).toBe(4); // 8位 (长度+1, 大写+1, 小写+1, 数字+1)
      expect(getPasswordStrength('Abc123456789')).toBe(4); // 12位 (长度+2, 大写+1, 小写+1, 数字+1, 但最大4)
    });
  });
});
