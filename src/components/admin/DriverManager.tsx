
import SimpleChauffeursList from "./SimpleChauffeursList";

export function DriverManager() {
  return <SimpleChauffeursList />;
}
                          placeholder="Minimaal 8 karakters"
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Herhaal het wachtwoord"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    {editingDriver ? "Bijwerken" : "Toevoegen"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Annuleren
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {drivers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen chauffeurs</h3>
            <p className="text-muted-foreground mb-4">
              Er zijn nog geen chauffeurs geregistreerd in het systeem.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefoon</TableHead>
                <TableHead>Bedrijf</TableHead>
                <TableHead>Adres</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">
                    {driver.display_name || (
                      <span className="text-muted-foreground italic">Geen naam</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {typeof driver.email === 'object' && driver.email !== null ? driver.email.email : driver.email || <span className="text-muted-foreground italic">Geen e-mail</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {driver.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {driver.phone}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Niet ingesteld</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {driver.company_name ? (
                      <div>
                        <p className="font-medium">{driver.company_name}</p>
                        {driver.btw_number && (
                          <p className="text-sm text-muted-foreground">{driver.btw_number}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Niet ingesteld</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {driver.address ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{driver.address}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Niet ingesteld</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDriver(driver)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Chauffeur verwijderen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Weet je zeker dat je {driver.display_name || driver.email} wilt verwijderen? 
                              Deze actie kan niet ongedaan worden gemaakt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDriver(driver)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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