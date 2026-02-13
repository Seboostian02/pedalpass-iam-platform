import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One digit', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
];

export function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordValid = PASSWORD_RULES.every((rule) => rule.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[RegisterForm] Submit attempt for:', email);

    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!passwordValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ email, password, firstName, lastName });
      console.log('[RegisterForm] Registration successful, navigating to dashboard');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      console.log('[RegisterForm] Registration failed:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
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
              Create <span className="text-primary">Account</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Register for PedalPass IAM
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {password && (
                <div className="space-y-1 pt-2">
                  {PASSWORD_RULES.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      {rule.test(password) ? (
                        <Check className="h-3 w-3 text-status-approved" />
                      ) : (
                        <X className="h-3 w-3 text-destructive" />
                      )}
                      <span className={rule.test(password) ? 'text-status-approved' : 'text-muted-foreground'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || !passwordValid}>
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
