'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  plan: 'free' | 'pro' | 'agency'
  audits_used_this_month: number
  audits_limit: number
  subscription_status: 'active' | 'canceled' | 'past_due' | null
  billing_provider: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      // Use service role key for admin access
      const res = await fetch('/api/admin/users', {
        headers: {
          'x-admin-key': 'croaudit-admin-2026',
        },
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function updateUserPlan(userId: string, plan: string) {
    setUpdating(userId)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'croaudit-admin-2026',
        },
        body: JSON.stringify({ user_id: userId, plan }),
      })
      if (!res.ok) throw new Error('Failed to update user')
      const data = await res.json()
      setSuccess(`Updated ${data.user.email} to ${plan} plan`)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setUpdating(null)
    }
  }

  function getPlanBadgeVariant(plan: string) {
    switch (plan) {
      case 'agency': return 'default' as const
      case 'pro': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  function getStatusColor(status: string | null) {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'canceled': return 'text-yellow-600'
      case 'past_due': return 'text-red-600'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Manage user plans and subscriptions (since Stripe isn&apos;t available in India)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>
            View and manage user subscriptions. Change plans to grant or revoke access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.full_name || 'No name'}</span>
                    <Badge variant={getPlanBadgeVariant(user.plan)}>
                      {user.plan.toUpperCase()}
                    </Badge>
                    <span className={`text-xs ${getStatusColor(user.subscription_status)}`}>
                      {user.subscription_status || 'no subscription'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Audits: {user.audits_used_this_month}/{user.audits_limit} this month
                    {user.current_period_end && (
                      <> · Expires: {new Date(user.current_period_end).toLocaleDateString()}</>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={user.plan}
                    onValueChange={(value) => {
                      if (value && value !== user.plan) {
                        updateUserPlan(user.id, value)
                      }
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                    </SelectContent>
                  </Select>
                  {updating === user.id && (
                    <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
                  )}
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">API Usage (curl):</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`# List all users
curl -H "x-admin-key: croaudit-admin-2026" \\
  http://localhost:3000/api/admin/users

# Upgrade user to Pro by email
curl -X PATCH -H "Content-Type: application/json" \\
  -H "x-admin-key: croaudit-admin-2026" \\
  -d '{"email":"user@example.com","plan":"pro"}' \\
  http://localhost:3000/api/admin/users

# Downgrade user to Free
curl -X PATCH -H "Content-Type: application/json" \\
  -H "x-admin-key: croaudit-admin-2026" \\
  -d '{"email":"user@example.com","plan":"free"}' \\
  http://localhost:3000/api/admin/users`}
            </pre>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={fetchUsers}>
              Refresh Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
