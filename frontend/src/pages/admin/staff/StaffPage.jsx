import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import { Badge, Button, Card, Input, Select, alertError, confirmAction, toastSuccess } from "../../../components/ui";
import CrudFormModal from "../../../design-system/crud/CrudFormModal";
import { useAuth } from "../../../context/AuthContext";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import { canManageStaff } from "../../../utils/permissions";

const initial = {
  name: "",
  email: "",
  phone: "",
  branch_id: "",
  role: "waiter",
  status: "active",
};

export default function StaffPage() {
  const { user } = useAuth();
  const allowManage = canManageStaff(user);
  const { data: shops = [], error: shopsError } = useShopsQuery();
  const [shopId, setShopId] = useState("");
  const { data: branches = [] } = useBranchesQuery(shopId);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (shops.length && !shopId) {
        setShopId(shops[0].id);
      }
      if (shopsError) {
        setLoadError(getApiErrorMessage(shopsError, "Unable to load shops."));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [shopId, shops, shopsError]);

  const load = useCallback(() => {
    if (!shopId) {
      setStaff([]);
      return Promise.resolve();
    }

    setLoading(true);
    setLoadError("");

    return api.get(`/shops/${shopId}/staff`)
      .then((staffResponse) => {
        setStaff(staffResponse.data.data.staff);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load staff.")))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setTemporaryPassword("");
    setForm(initial);
    setModalOpen(true);
  };

  const openEdit = (staffMember) => {
    setEditing(staffMember);
    setTemporaryPassword("");
    setForm({
      name: staffMember.user?.name || "",
      email: staffMember.user?.email || "",
      phone: staffMember.user?.phone || "",
      branch_id: staffMember.branch_id || "",
      role: staffMember.role,
      status: staffMember.status,
    });
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      if (editing) {
        await api.put(`/shop-staff/${editing.id}`, {
          branch_id: form.branch_id || null,
          role: form.role,
          status: form.status,
        });
        await toastSuccess("Staff updated.");
      } else {
        const response = await api.post(`/shops/${shopId}/staff`, {
          ...form,
          branch_id: form.branch_id || null,
        });
        setTemporaryPassword(response.data.data.temporary_password || "");
        await toastSuccess("Staff added.");
      }
      load();
      if (editing) {
        setModalOpen(false);
      }
    } catch (error) {
      alertError(error, "Please review the staff details.");
    }
  };

  const updateStatus = async (staffMember, status) => {
    if (!await confirmAction(`${status === "inactive" ? "Disable" : "Activate"} staff?`, staffMember.user?.email || "This staff account will be updated.")) return;

    await api.put(`/shop-staff/${staffMember.id}/status`, { status });
    await toastSuccess("Staff status updated.");
    load();
  };

  const remove = async (staffMember) => {
    if (!await confirmAction("Remove staff?", staffMember.user?.email || "This staff assignment will be removed.")) return;

    await api.delete(`/shop-staff/${staffMember.id}`);
    await toastSuccess("Staff removed.");
    load();
  };

  const copyTemporaryPassword = async () => {
    await navigator.clipboard?.writeText(temporaryPassword);
    await toastSuccess("Temporary password copied.");
  };

  return (
    <div className="grid gap-6">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Team access</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Staff</h1>
            <p className="mt-1 text-sm text-slate-500">Manage branch assignments and staff roles for each shop.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select label="Shop" value={shopId} onChange={(event) => setShopId(event.target.value)} options={shops.map((shop) => [shop.id, shop.name])} />
            {allowManage ? <Button type="button" onClick={openCreate}>Add staff</Button> : null}
          </div>
        </div>
      </Card>

      <DataTable
        columns={[
          { key: "user", label: "Name", render: (row) => row.user?.name },
          { key: "email", label: "Email", render: (row) => row.user?.email },
          { key: "role", label: "Role", render: (row) => <Badge tone="blue">{row.role}</Badge> },
          { key: "branch", label: "Branch", render: (row) => row.branch?.name || "All branches" },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={staff}
        loading={loading}
        error={loadError}
        emptyMessage="No staff assigned yet."
        renderActions={allowManage ? (staffMember) => (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => openEdit(staffMember)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button>
            <button onClick={() => updateStatus(staffMember, staffMember.status === "active" ? "inactive" : "active")} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white">
              {staffMember.status === "active" ? "Disable" : "Activate"}
            </button>
            <button onClick={() => remove(staffMember)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Remove</button>
          </div>
        ) : undefined}
      />

      <CrudFormModal
        open={modalOpen}
        title={editing ? "Edit staff" : "Add staff"}
        description="Configure the staff role and branch access for this shop."
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? "Save changes" : "Add staff"}
        disabled={!allowManage}
      >
          {!editing ? (
            <>
              <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <Input label="Email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </>
          ) : (
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">{editing.user?.email}</div>
          )}
          <Select label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} options={[["manager", "Manager"], ["cashier", "Cashier"], ["waiter", "Waiter"]]} />
          <Select label="Branch" value={form.branch_id} onChange={(event) => setForm({ ...form, branch_id: event.target.value })} options={[["", "All branches"], ...branches.map((branch) => [branch.id, branch.name])]} />
          <Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} options={[["active", "Active"], ["inactive", "Inactive"]]} />

          {temporaryPassword ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-900">Temporary password</p>
              <p className="mt-1 font-mono text-sm text-amber-900">{temporaryPassword}</p>
              <p className="mt-1 text-xs text-amber-800">Shown once. Share it securely and ask the staff member to change it later.</p>
              <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={copyTemporaryPassword}>Copy</Button>
            </div>
          ) : null}

      </CrudFormModal>
    </div>
  );
}
