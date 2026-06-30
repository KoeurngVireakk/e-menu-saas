import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, Power, Search, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import api, { getApiErrorMessage } from "../../../api/axios";
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

function isRequestCanceled(error) {
  return error?.name === "CanceledError" || error?.code === "ERR_CANCELED";
}

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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const timer = setTimeout(() => {
      if (!isActive || !mountedRef.current) return;

      if (shops.length && !shopId) {
        setShopId(shops[0].id);
      }
      if (shopsError) {
        setLoadError(getApiErrorMessage(shopsError, "Unable to load shops."));
      }
    }, 0);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [shopId, shops, shopsError]);

  const load = useCallback(async ({ signal, isActive = () => true } = {}) => {
    const canUpdate = () => mountedRef.current && isActive() && !signal?.aborted;

    if (!shopId) {
      if (canUpdate()) {
        setStaff([]);
        setLoading(false);
      }
      return;
    }

    if (!canUpdate()) return;

    setLoading(true);
    setLoadError("");

    try {
      const staffResponse = await api.get(`/shops/${shopId}/staff`, { signal });

      if (!canUpdate()) return;

      setStaff(staffResponse.data?.data?.staff ?? []);
    } catch (error) {
      if (!canUpdate() || isRequestCanceled(error)) return;

      setLoadError(getApiErrorMessage(error, "Unable to load staff."));
    } finally {
      if (canUpdate()) {
        setLoading(false);
      }
    }
  }, [shopId]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void load({ signal: controller.signal, isActive: () => isActive });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
      controller.abort();
    };
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

  const filteredStaff = staff.filter((staffMember) => {
    const haystack = [
      staffMember.user?.name,
      staffMember.user?.email,
      staffMember.user?.phone,
      staffMember.role,
      staffMember.status,
      staffMember.branch?.name,
    ].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesRole = !roleFilter || staffMember.role === roleFilter;
    const matchesStatus = !statusFilter || staffMember.status === statusFilter;
    const matchesBranch = branchFilter === "" || String(staffMember.branch_id || "") === branchFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesBranch;
  });
  const activeCount = staff.filter((staffMember) => staffMember.status === "active").length;
  const managerCount = staff.filter((staffMember) => staffMember.role === "manager").length;
  const selectedShop = shops.find((shop) => String(shop.id) === String(shopId));
  const hasFilters = Boolean(search || roleFilter || statusFilter || branchFilter);

  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-4 bg-linear-to-br from-blue-50 via-white to-slate-50 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-black text-blue-700 shadow-sm shadow-blue-900/5">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Team access · ការគ្រប់គ្រងអ្នកប្រើ
            </div>
            <h1 className="khmer-heading mt-3 text-3xl font-black text-slate-950">Staff & user management</h1>
            <p className="khmer-text mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">Manage real staff assignments, branch scope, roles, and account status for {selectedShop?.name || "the selected shop"}.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Select label="Shop" value={shopId} onChange={(event) => setShopId(event.target.value)} options={shops.map((shop) => [shop.id, shop.name])} />
            {allowManage ? <Button type="button" onClick={openCreate} className="min-h-12"><Plus className="h-4 w-4" aria-hidden="true" /> Add staff</Button> : null}
          </div>
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Staff summary">
        <SummaryTile icon={<UsersRound className="h-5 w-5" />} label="Total users" value={staff.length} helper="Assigned to this shop" />
        <SummaryTile icon={<Power className="h-5 w-5" />} label="Active" value={activeCount} helper="Can access assigned scope" />
        <SummaryTile icon={<ShieldCheck className="h-5 w-5" />} label="Managers" value={managerCount} helper="Can view team access" />
      </section>

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_repeat(3,minmax(160px,220px))]">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Search
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, phone, role" className="khmer-text min-h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
            </span>
          </label>
          <Select label="Role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} options={[["", "All roles"], ["manager", "Manager"], ["cashier", "Cashier"], ["waiter", "Waiter"]]} />
          <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[["", "All statuses"], ["active", "Active"], ["inactive", "Inactive"]]} />
          <Select label="Branch" value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} options={[["", "All branches"], ...branches.map((branch) => [String(branch.id), branch.name])]} />
        </div>
        {hasFilters ? <button type="button" onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); setBranchFilter(""); }} className="mt-3 text-sm font-black text-blue-700 hover:text-blue-900">Clear filters</button> : null}
      </Card>

      <Card className="overflow-hidden p-0">
        {loading ? <StateBlock title="Loading staff..." /> : null}
        {!loading && loadError ? <StateBlock title={loadError} tone="error" /> : null}
        {!loading && !loadError && !staff.length ? <StateBlock title="No staff assigned yet." description="Add staff to give managers, cashiers, and waiters scoped access to this shop." /> : null}
        {!loading && !loadError && staff.length > 0 && !filteredStaff.length ? <StateBlock title="No staff match these filters." description="Clear filters to review all staff assignments." /> : null}
        {!loading && !loadError && filteredStaff.length ? (
          <div className="divide-y divide-slate-200">
            <div className="hidden grid-cols-[minmax(220px,1.4fr)_1fr_130px_150px_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-black text-slate-500 lg:grid">
              <span>User</span>
              <span>Branch</span>
              <span>Role</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            {filteredStaff.map((staffMember) => (
              <StaffRow
                key={staffMember.id}
                staffMember={staffMember}
                allowManage={allowManage}
                isSelf={staffMember.user_id === user?.id || staffMember.user?.id === user?.id}
                onEdit={openEdit}
                onStatus={updateStatus}
                onRemove={remove}
              />
            ))}
          </div>
        ) : null}
      </Card>

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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-600">
              <p className="font-black text-slate-950">{editing.user?.name}</p>
              <p className="mt-1">{editing.user?.email}</p>
            </div>
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

function SummaryTile({ icon, label, value, helper }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">{icon}</div>
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{helper}</p>
        </div>
      </div>
    </Card>
  );
}

function StaffRow({ staffMember, allowManage, isSelf, onEdit, onStatus, onRemove }) {
  const nextStatus = staffMember.status === "active" ? "inactive" : "active";

  return (
    <article className="grid gap-3 p-4 lg:grid-cols-[minmax(220px,1.4fr)_1fr_130px_150px_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-black text-white">
            {initials(staffMember.user?.name || staffMember.user?.email)}
          </div>
          <div className="min-w-0">
            <p className="khmer-heading truncate text-sm font-black text-slate-950">{staffMember.user?.name || "Unnamed user"} {isSelf ? <span className="text-xs text-blue-600">(you)</span> : null}</p>
            <p className="truncate text-sm font-semibold text-slate-500">{staffMember.user?.email}</p>
            {staffMember.user?.phone ? <p className="truncate text-xs font-semibold text-slate-400">{staffMember.user.phone}</p> : null}
          </div>
        </div>
      </div>
      <p className="text-sm font-bold text-slate-700"><span className="lg:hidden">Branch: </span>{staffMember.branch?.name || "All branches"}</p>
      <div><RoleBadge role={staffMember.role} /></div>
      <div><StatusBadge value={staffMember.status} /></div>
      {allowManage ? (
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <IconAction label="Edit" onClick={() => onEdit(staffMember)} disabled={isSelf}><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</IconAction>
          <IconAction label={nextStatus === "inactive" ? "Disable" : "Activate"} onClick={() => onStatus(staffMember, nextStatus)} disabled={isSelf} dark><Power className="h-4 w-4" aria-hidden="true" />{nextStatus === "inactive" ? "Disable" : "Activate"}</IconAction>
          <IconAction label="Remove" onClick={() => onRemove(staffMember)} disabled={isSelf} danger><Trash2 className="h-4 w-4" aria-hidden="true" /> Remove</IconAction>
        </div>
      ) : null}
    </article>
  );
}

function RoleBadge({ role }) {
  const tones = { manager: "blue", cashier: "emerald", waiter: "slate" };
  return <Badge tone={tones[role] || "slate"}>{roleLabel(role)}</Badge>;
}

function IconAction({ children, label, onClick, disabled, dark, danger }) {
  const tone = danger ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : dark ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className={`khmer-button inline-flex min-h-10 items-center gap-2 rounded-2xl border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${tone}`}>
      {children}
    </button>
  );
}

function StateBlock({ title, description, tone = "empty" }) {
  return (
    <div className={`grid place-items-center p-8 text-center ${tone === "error" ? "text-rose-700" : "text-slate-600"}`}>
      <p className="khmer-heading text-base font-black">{title}</p>
      {description ? <p className="khmer-text mt-2 max-w-md text-sm font-semibold leading-6">{description}</p> : null}
    </div>
  );
}

function initials(value) {
  return String(value || "U").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function roleLabel(role) {
  return ({ manager: "Manager", cashier: "Cashier", waiter: "Waiter" })[role] || role;
}
