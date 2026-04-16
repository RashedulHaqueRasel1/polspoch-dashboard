"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useDeleteUser, useGetAllUsers } from "@/lib/hooks/useAuth";
import UserViewModal from "./UserViewModal";
import UserEditModal from "./UserEditModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TUser } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const UserList = () => {
  const { data, isLoading } = useGetAllUsers();
  const users = data?.data || [];

  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { mutate: deleteUser } = useDeleteUser();

  const handleView = (user: TUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user: TUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    // if (!confirm("Are you sure you want to delete this user?")) return;

    setDeletingUserId(userId);
    deleteUser(userId, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success(res.message || "User deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["all-users"] });
        } else {
          toast.error(res.message || "Failed to delete user");
        }
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "An error occurred while deleting",
        );
      },
      onSettled: () => {
        setDeletingUserId(null);
      },
    });
  };


  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user: TUser) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage
                        src={user.image?.url}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {user._id.slice(-6)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
                {/* <TableCell>
                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.isVerified ? (
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Verified</Badge>
                                    ) : (
                                        <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none">Unverified</Badge>
                                    )}
                                </TableCell> */}
                <TableCell>
                  {user.role === "admin" ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      ADMIN
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      USER
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  {user.isVerified ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                      Unverified
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(user)}
                      className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                      className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingUserId === user._id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <UserViewModal
        key={selectedUser?._id ? `view-${selectedUser._id}` : "view-none"}
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
      />

      <UserEditModal
        key={selectedUser?._id ? `edit-${selectedUser._id}` : "edit-none"}
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default UserList;
