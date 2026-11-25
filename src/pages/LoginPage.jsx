import { useLayoutEffect, useState } from 'react';

const pageCopy = {
  login: {
    title: 'مرحبًا بعودتك',
    description: 'سجّل الدخول للمتابعة إلى لوحة إدارة العيادة.',
    submit: 'تسجيل الدخول',
  },
  signup: {
    title: 'أنشئ حساب العيادة',
    description: 'أدخل بياناتك للبدء باستخدام كلينيكسيا.',
    submit: 'إنشاء الحساب',
  },
  reset: {
    title: 'استعادة كلمة المرور',
    description: 'أدخل بريدك الإلكتروني لاستعادة إمكانية الوصول.',
    submit: 'إرسال رابط الاستعادة',
  },
};

function EyeIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.9 5.2A10.7 10.7 0 0112 5c5.1 0 8.5 4.7 9.5 6.3a1.2 1.2 0 010 1.4 15.4 15.4 0 01-3 3.4M6.2 6.3a16.2 16.2 0 00-3.7 5 1.2 1.2 0 000 1.4C3.5 14.3 6.9 19 12 19c.8 0 1.6-.1 2.3-.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12s3.4-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.4 6.5-9.5 6.5S2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function AuthField({ id, label, type = 'text', autoComplete, ...props }) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        {...props}
      />
    </label>
  );
}

function PasswordField({ id, label, visible, onToggle, autoComplete, minLength, placeholder }) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <span className="auth-password-input">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder={placeholder}
          dir="ltr"
          required
        />
        <button
          className="auth-password-toggle"
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          title={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          <EyeIcon visible={visible} />
        </button>
      </span>
    </label>
  );
}

function LoginPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeIsError, setNoticeIsError] = useState(false);
  const copy = pageCopy[mode] || pageCopy.login;
  const isSignup = mode === 'signup';
  const isReset = mode === 'reset';

  useLayoutEffect(() => {
    const previousBodyClass = document.body.className;
    const previousTitle = document.title;

    document.body.classList.add('auth-layout');
    document.title = `${copy.title} | كلينيكسيا`;

    return () => {
      document.body.className = previousBodyClass;
      document.title = previousTitle;
    };
  }, [copy.title]);

  function changeMode(nextMode) {
    if (nextMode === mode) {
      return;
    }

    const nextUrl = new URL('/', window.location.origin);
    nextUrl.searchParams.set('auth', nextMode);
    window.history.pushState({}, '', nextUrl);
    setMode(nextMode);
    setNotice('');
    setNoticeIsError(false);
    setPasswordVisible(false);
  }

  useLayoutEffect(() => {
    function syncModeFromHistory() {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      const queryMode = new URLSearchParams(window.location.search).get('auth');
      const nextMode = ['login', 'signup', 'reset'].includes(queryMode)
        ? queryMode
        : path === '/signup'
          ? 'signup'
          : 'login';

      setMode(nextMode);
      setNotice('');
      setNoticeIsError(false);
      setPasswordVisible(false);
    }

    window.addEventListener('popstate', syncModeFromHistory);
    return () => window.removeEventListener('popstate', syncModeFromHistory);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setNoticeIsError(false);

    if (isSignup) {
      const formData = new FormData(event.currentTarget);
      if (formData.get('password') !== formData.get('confirm-password')) {
        setNoticeIsError(true);
        setNotice('كلمتا المرور غير متطابقتين.');
        return;
      }
    }

    setNotice('واجهة المصادقة جاهزة، لكنها غير متصلة بعد بخدمة الحسابات.');
  }

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-form-side" aria-labelledby="auth-title">
        <div className="auth-form-content">
          <a className="auth-wordmark" href="/" aria-label="كلينيكسيا - الرئيسية">
            <span>
              <strong>كلينيكسيا</strong>
              <small>نظام إدارة العيادات</small>
            </span>
          </a>

          {!isReset && (
            <div className="auth-mode-switch" role="group" aria-label="اختيار نوع الحساب">
              <button
                type="button"
                aria-pressed={!isSignup}
                className={!isSignup ? 'is-active' : ''}
                onClick={() => changeMode('login')}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                aria-pressed={isSignup}
                className={isSignup ? 'is-active' : ''}
                onClick={() => changeMode('signup')}
              >
                إنشاء حساب
              </button>
            </div>
          )}

          <div className="auth-heading">
            <span className="auth-eyebrow">بوابة العيادة</span>
            <h1 id="auth-title">{copy.title}</h1>
            <p>{copy.description}</p>
          </div>

          <form className="auth-form" id="auth-form" key={mode} onSubmit={handleSubmit}>
            {isSignup && (
              <AuthField
                id="full-name"
                label="الاسم بالكامل"
                placeholder="اكتب اسمك"
                autoComplete="name"
              />
            )}

            <AuthField
              id="email"
              label="البريد الإلكتروني"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              dir="ltr"
            />

            {!isReset && (
              <PasswordField
                id="password"
                label="كلمة المرور"
                visible={passwordVisible}
                onToggle={() => setPasswordVisible((visible) => !visible)}
                placeholder={isSignup ? '8 أحرف على الأقل' : 'أدخل كلمة المرور'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                minLength={isSignup ? 8 : undefined}
              />
            )}

            {isSignup && (
              <PasswordField
                id="confirm-password"
                label="تأكيد كلمة المرور"
                visible={passwordVisible}
                onToggle={() => setPasswordVisible((visible) => !visible)}
                placeholder="أعد كتابة كلمة المرور"
                autoComplete="new-password"
                minLength={8}
              />
            )}

            {!isSignup && !isReset && (
              <div className="auth-form-options">
                <button type="button" onClick={() => changeMode('reset')}>
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            {notice && (
              <p
                className={`auth-notice${noticeIsError ? ' is-error' : ''}`}
                role={noticeIsError ? 'alert' : 'status'}
              >
                {notice}
              </p>
            )}

            <button className="auth-submit" type="submit">
              {copy.submit}
              <span aria-hidden="true">←</span>
            </button>
          </form>

          <p className="auth-switch">
            {isReset ? (
              <>
                تذكرت كلمة المرور؟
                {' '}
                <button type="button" className="auth-inline-button" onClick={() => changeMode('login')}>
                  تسجيل الدخول
                </button>
              </>
            ) : isSignup ? (
              <>
                لديك حساب بالفعل؟
                {' '}
                <button type="button" className="auth-inline-button" onClick={() => changeMode('login')}>
                  تسجيل الدخول
                </button>
              </>
            ) : (
              <>
                ليس لديك حساب؟
                {' '}
                <button type="button" className="auth-inline-button" onClick={() => changeMode('signup')}>
                  إنشاء حساب جديد
                </button>
              </>
            )}
          </p>
        </div>
      </section>

      <aside className="auth-brand-side">
        <div className="auth-brand-top">
          <strong className="auth-brand-name">كلينيكسيا</strong>
          <span>
            <strong>إدارة عيادتك بذكاء</strong>
            <small>نظام متكامل لإدارة العيادات</small>
          </span>
        </div>

        <div className="auth-brand-copy">
          <span className="auth-brand-label">كل تفاصيل عيادتك في مكان واحد</span>
          <h2>وقت أقل في الإدارة، واهتمام أكبر بكل مريض.</h2>
          <p>
            نظّم سجل المرضى، تابع طابور العيادة، وأدر الزيارات اليومية من
            تجربة واحدة سهلة وواضحة.
          </p>

          <div className="auth-feature-card">
            <div className="auth-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="19" cy="6" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <strong>رعاية منظمة تبدأ من إدارة أفضل</strong>
              <span>المرضى · المواعيد · سجل اليوم</span>
            </div>
            <span className="auth-feature-dot" aria-hidden="true" />
          </div>
        </div>

        <footer className="auth-brand-footer">
          <span>عيادة أ.د. عفيفي فهمي عفيفي أحمد</span>
          <a href="/">العودة إلى الرئيسية</a>
        </footer>
      </aside>
    </main>
  );
}

export default LoginPage;
