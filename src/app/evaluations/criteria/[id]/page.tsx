'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
// removed: import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Calendar, User, Code, FileText } from 'lucide-react';
import { evaluationCriteriaService } from '@/services/evaluationCriteria';
import { ApiEvaluationCriteria } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout';
import { Modal } from '@/components/ui/Modal';

export default function EvaluationCriteriaDetailPage() {
  const params = useParams()
  const itemId = typeof params?.id === 'string' ? params.id : '';
  const router = useRouter();
  const [criterion, setCriterion] = useState<ApiEvaluationCriteria | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const criterionId = itemId as string;

  useEffect(() => {
    fetchCriterion();
  }, [criterionId]);

  const fetchCriterion = async () => {
    try {
      setLoading(true);
      const data = await evaluationCriteriaService.getCriterion(criterionId);
      setCriterion(data);
    } catch (error) {
      console.error('Erreur lors du chargement du critère:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await evaluationCriteriaService.deleteCriterion(criterionId);
      console.log('Critère supprimé avec succès');
      router.push('/evaluations/criteria');
    } catch (error) {
      console.error('Erreur lors de la suppression du critère:', error);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = () => {
    router.push(`/evaluations/criteria/${criterionId}/edit`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!criterion) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Critère non trouvé</p>
              <Button onClick={() => router.back()} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{criterion.name}</h1>
              <p className="text-muted-foreground">Détails du critère d'évaluation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={criterion.active ? 'success' : 'danger'}>
              {criterion.active ? 'Actif' : 'Inactif'}
            </Badge>
            <Button onClick={handleEdit} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!criterion.isDeletable}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nom</label>
                <p className="text-base font-medium">{criterion.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-base">{criterion.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Code</label>
                <p className="text-base font-mono">{criterion.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">UUID</label>
                <p className="text-sm font-mono text-gray-600">{criterion.uuid}</p>
              </div>
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Métadonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Créé le</label>
                <p className="text-base">
                  {format(new Date(criterion.createdDate), 'PPP à p')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Créé par</label>
                <p className="text-base">{criterion.createdBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Modifié le</label>
                <p className="text-base">
                  {format(new Date(criterion.lastModifiedDate), 'PPP à p')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Modifié par</label>
                <p className="text-base">{criterion.lastModifiedBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Version</label>
                <p className="text-base">{criterion.version}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de confirmation suppression */}
        <Modal isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} title="Confirmer la suppression" size="sm">
          <div className="space-y-4">
            <p>
              Êtes-vous sûr de vouloir supprimer le critère "{criterion?.name}" ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}