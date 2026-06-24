import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }

    authService.validateResetToken(token)
      .then(() => setIsTokenValid(true))
      .catch(() => setIsTokenValid(false))
      .finally(() => setIsValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token, newPassword });
      toast.success(t('auth.passwordResetSuccess'));
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.loginFailed');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center space-y-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('auth.checkingToken')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center space-y-4 py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.invalidResetToken')}
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to={ROUTES.LOGIN} className="inline-flex items-center text-sm text-primary hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="items-center space-y-4">
          <img src={logoSvg} alt="PedalPass" className="h-20 w-20" />
          <div className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Pedal<span className="text-primary">Pass</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('auth.resetPasswordDescription')}
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.createPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>{t('auth.passwordRules.minLength')}</li>
              <li>{t('auth.passwordRules.uppercase')}</li>
              <li>{t('auth.passwordRules.lowercase')}</li>
              <li>{t('auth.passwordRules.digit')}</li>
              <li>{t('auth.passwordRules.special')}</li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {t('auth.resetPassword')}
                </>
              )}
            </Button>
            <Link to={ROUTES.LOGIN} className="inline-flex items-center text-sm text-primary hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
