import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        setUsers([]);
        toast({
          title: "Fout bij laden gebruikers",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      setUsers([]);
      toast({
        title: "Fout bij laden gebruikers",
        description: error instanceof Error ? error.message : "Kon gebruikers niet laden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (user: any) => {
    try {
      // Verwijder uit users-tabel
      const { error } = await supabase.from('users').delete().eq('id', user.id);
      if (error) throw error;

      // Verwijder uit auth.users
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (authDeleteError) {
        throw new Error('Gebruiker uit database verwijderd, maar niet uit authenticatie.');
      }

      toast({
        title: "Gebruiker verwijderd",
        description: `${user.email} is succesvol verwijderd.`,
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Fout bij verwijderen",
        description: error instanceof Error ? error.message : "Kon gebruiker niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gebruikersbeheer</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-12 text-center">Laden...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center">Geen gebruikers gevonden.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.display_name || <span className="text-muted-foreground italic">Geen naam</span>}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user)}>
                      <Trash2 className="w-4 h-4" /> Verwijderen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
