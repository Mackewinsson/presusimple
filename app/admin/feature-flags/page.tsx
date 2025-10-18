"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Flag, Plus, Edit, Trash2, Save, X, Users, Monitor, Smartphone, Settings } from "lucide-react";
import Link from "next/link";

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

interface Feature {
  _id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  platforms: ('web' | 'mobile')[];
  userTypes: ('free' | 'pro' | 'admin')[];
  rolloutPercentage: number;
  targetUsers?: string[];
  excludeUsers?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export default function FeatureFlagsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  
  // Form state for creating/editing
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
    platforms: [] as ('web' | 'mobile')[],
    userTypes: [] as ('free' | 'pro' | 'admin')[],
    rolloutPercentage: 100,
    targetUsers: '',
    excludeUsers: '',
    metadata: '',
  });

  // Check if user is authorized
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    const userEmail = session.user?.email;
    if (!userEmail || !AUTHORIZED_ADMINS.includes(userEmail)) {
      toast.error("Access denied. You are not authorized to view this page.");
      router.replace("/budget");
      return;
    }
  }, [session, status, router]);

  // Load features
  useEffect(() => {
    if (session?.user?.email && AUTHORIZED_ADMINS.includes(session.user.email)) {
      loadFeatures();
    }
  }, [session]);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/features');
      if (response.ok) {
        const data = await response.json();
        setFeatures(data);
      } else {
        toast.error('Failed to load features');
      }
    } catch (error) {
      console.error('Error loading features:', error);
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeature = async () => {
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        targetUsers: formData.targetUsers ? formData.targetUsers.split(',').map(id => id.trim()) : [],
        excludeUsers: formData.excludeUsers ? formData.excludeUsers.split(',').map(id => id.trim()) : [],
        metadata: formData.metadata ? JSON.parse(formData.metadata) : {},
      };

      const response = await fetch('/api/admin/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Feature created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        loadFeatures();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create feature');
      }
    } catch (error) {
      console.error('Error creating feature:', error);
      toast.error('Failed to create feature');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeature = async (feature: Feature) => {
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        targetUsers: formData.targetUsers ? formData.targetUsers.split(',').map(id => id.trim()) : [],
        excludeUsers: formData.excludeUsers ? formData.excludeUsers.split(',').map(id => id.trim()) : [],
        metadata: formData.metadata ? JSON.parse(formData.metadata) : {},
      };

      const response = await fetch(`/api/admin/features/${feature.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Feature updated successfully');
        setEditingFeature(null);
        resetForm();
        loadFeatures();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update feature');
      }
    } catch (error) {
      console.error('Error updating feature:', error);
      toast.error('Failed to update feature');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeature = async (feature: Feature) => {
    if (!confirm(`Are you sure you want to delete the feature "${feature.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/features/${feature.key}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Feature deleted successfully');
        loadFeatures();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete feature');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error('Failed to delete feature');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (feature: Feature) => {
    try {
      const response = await fetch(`/api/admin/features/${feature.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !feature.enabled }),
      });

      if (response.ok) {
        toast.success(`Feature ${!feature.enabled ? 'enabled' : 'disabled'} successfully`);
        loadFeatures();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update feature');
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Failed to update feature');
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      enabled: false,
      platforms: [],
      userTypes: [],
      rolloutPercentage: 100,
      targetUsers: '',
      excludeUsers: '',
      metadata: '',
    });
  };

  const openEditDialog = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      key: feature.key,
      name: feature.name,
      description: feature.description,
      enabled: feature.enabled,
      platforms: feature.platforms,
      userTypes: feature.userTypes,
      rolloutPercentage: feature.rolloutPercentage,
      targetUsers: feature.targetUsers?.join(', ') || '',
      excludeUsers: feature.excludeUsers?.join(', ') || '',
      metadata: feature.metadata ? JSON.stringify(feature.metadata, null, 2) : '',
    });
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Flag className="h-8 w-8" />
              Feature Flags Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage feature flags for web and mobile applications
            </p>
            <p className="text-sm text-green-600 mt-1">
              Logged in as: {session?.user?.email}
            </p>
            <div className="mt-4">
              <Link href="/admin">
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <Settings className="h-4 w-4 mr-2" />
                  Go to Unified Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Create Feature Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Feature Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Feature Flag</DialogTitle>
                <DialogDescription>
                  Create a new feature flag that can be controlled across web and mobile platforms.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="key">Feature Key</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="e.g., new_dashboard"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Feature Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., New Dashboard"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this feature does..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label htmlFor="enabled">Enabled by default</Label>
                </div>

                <div>
                  <Label>Platforms</Label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="web"
                        checked={formData.platforms.includes('web')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, platforms: [...formData.platforms, 'web'] });
                          } else {
                            setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== 'web') });
                          }
                        }}
                      />
                      <Label htmlFor="web" className="flex items-center">
                        <Monitor className="h-4 w-4 mr-1" />
                        Web
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mobile"
                        checked={formData.platforms.includes('mobile')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, platforms: [...formData.platforms, 'mobile'] });
                          } else {
                            setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== 'mobile') });
                          }
                        }}
                      />
                      <Label htmlFor="mobile" className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-1" />
                        Mobile
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>User Types</Label>
                  <div className="flex space-x-4 mt-2">
                    {['free', 'pro', 'admin'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={type}
                          checked={formData.userTypes.includes(type as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, userTypes: [...formData.userTypes, type as any] });
                            } else {
                              setFormData({ ...formData, userTypes: formData.userTypes.filter(t => t !== type) });
                            }
                          }}
                        />
                        <Label htmlFor={type} className="capitalize">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="rollout">Rollout Percentage</Label>
                  <Input
                    id="rollout"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.rolloutPercentage}
                    onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="targetUsers">Target User IDs (comma-separated)</Label>
                  <Input
                    id="targetUsers"
                    value={formData.targetUsers}
                    onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                    placeholder="user1, user2, user3"
                  />
                </div>

                <div>
                  <Label htmlFor="excludeUsers">Exclude User IDs (comma-separated)</Label>
                  <Input
                    id="excludeUsers"
                    value={formData.excludeUsers}
                    onChange={(e) => setFormData({ ...formData, excludeUsers: e.target.value })}
                    placeholder="user1, user2, user3"
                  />
                </div>

                <div>
                  <Label htmlFor="metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="metadata"
                    value={formData.metadata}
                    onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                    placeholder='{"config": "value"}'
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFeature} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Feature
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Feature Dialog */}
          <Dialog open={!!editingFeature} onOpenChange={() => setEditingFeature(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Feature Flag</DialogTitle>
                <DialogDescription>
                  Update the feature flag configuration.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-key">Feature Key</Label>
                    <Input
                      id="edit-key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="e.g., new_dashboard"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">Feature Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., New Dashboard"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this feature does..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label htmlFor="edit-enabled">Enabled</Label>
                </div>

                <div>
                  <Label>Platforms</Label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-web"
                        checked={formData.platforms.includes('web')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, platforms: [...formData.platforms, 'web'] });
                          } else {
                            setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== 'web') });
                          }
                        }}
                      />
                      <Label htmlFor="edit-web" className="flex items-center">
                        <Monitor className="h-4 w-4 mr-1" />
                        Web
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-mobile"
                        checked={formData.platforms.includes('mobile')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, platforms: [...formData.platforms, 'mobile'] });
                          } else {
                            setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== 'mobile') });
                          }
                        }}
                      />
                      <Label htmlFor="edit-mobile" className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-1" />
                        Mobile
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>User Types</Label>
                  <div className="flex space-x-4 mt-2">
                    {['free', 'pro', 'admin'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-${type}`}
                          checked={formData.userTypes.includes(type as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, userTypes: [...formData.userTypes, type as any] });
                            } else {
                              setFormData({ ...formData, userTypes: formData.userTypes.filter(t => t !== type) });
                            }
                          }}
                        />
                        <Label htmlFor={`edit-${type}`} className="capitalize">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-rollout">Rollout Percentage</Label>
                  <Input
                    id="edit-rollout"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.rolloutPercentage}
                    onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-targetUsers">Target User IDs (comma-separated)</Label>
                  <Input
                    id="edit-targetUsers"
                    value={formData.targetUsers}
                    onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                    placeholder="user1, user2, user3"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-excludeUsers">Exclude User IDs (comma-separated)</Label>
                  <Input
                    id="edit-excludeUsers"
                    value={formData.excludeUsers}
                    onChange={(e) => setFormData({ ...formData, excludeUsers: e.target.value })}
                    placeholder="user1, user2, user3"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="edit-metadata"
                    value={formData.metadata}
                    onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                    placeholder='{"config": "value"}'
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingFeature(null)}>
                  Cancel
                </Button>
                <Button onClick={() => editingFeature && handleUpdateFeature(editingFeature)} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Feature
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Features List */}
          <div className="grid gap-4">
            {features.map((feature) => (
              <Card key={feature._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {feature.name}
                        <Badge variant={feature.enabled ? "default" : "secondary"}>
                          {feature.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => handleToggleFeature(feature)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(feature)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFeature(feature)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Key:</strong> <code>{feature.key}</code>
                    </div>
                    <div>
                      <strong>Platforms:</strong> {feature.platforms.join(', ')}
                    </div>
                    <div>
                      <strong>User Types:</strong> {feature.userTypes.join(', ')}
                    </div>
                    <div>
                      <strong>Rollout:</strong> {feature.rolloutPercentage}%
                    </div>
                  </div>
                  {feature.targetUsers && feature.targetUsers.length > 0 && (
                    <div className="mt-2 text-sm">
                      <strong>Target Users:</strong> {feature.targetUsers.length} users
                    </div>
                  )}
                  {feature.excludeUsers && feature.excludeUsers.length > 0 && (
                    <div className="mt-2 text-sm">
                      <strong>Excluded Users:</strong> {feature.excludeUsers.length} users
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {features.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No feature flags yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first feature flag to start controlling features across your applications.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Feature Flag
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
