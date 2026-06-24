import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('auth.fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword({ email });
      setIsSent(true);
    } catch {
      // Always show success message (security: no email enumeration)
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {t('auth.forgotPasswordDescription')}
            </CardDescription>
          </div>
        </CardHeader>

        {isSent ? (
          <CardContent className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('auth.resetLinkSent')}
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {t('auth.sendResetLink')}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}

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
