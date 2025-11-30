import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TableDemo from '@/views/TableDemo.vue'

describe('TableDemo.vue', () => {
  it('renders VirtualTable with correct props', () => {
    const wrapper = mount(TableDemo)
    
    // Check if VirtualTable component is rendered
    const virtualTable = wrapper.findComponent({ name: 'VirtualTable' })
    expect(virtualTable.exists()).toBe(true)
    
    // Check props passed to VirtualTable
    expect(virtualTable.props('readonly')).toBe(true)
    expect(virtualTable.props('darkTheme')).toBe(false)
    expect(virtualTable.props('columns')).toEqual(['ID', 'Name', 'Email'])
    expect(virtualTable.props('data')).toHaveLength(1000)
  })

  it('renders readonly control with checkbox', () => {
    const wrapper = mount(TableDemo)
    
    // Check if readonly control exists
    const readonlyControl = wrapper.find('.readonly-control')
    expect(readonlyControl.exists()).toBe(true)
    
    // Check if checkbox exists and is checked by default within readonly control
    const checkbox = readonlyControl.find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)
    expect(checkbox.element.checked).toBe(true)
  })

  it('displays correct readonly status', () => {
    const wrapper = mount(TableDemo)
    
    const status = wrapper.find('.status')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('READ ONLY')
    expect(status.classes()).toContain('active')
  })

  it('toggles readonly state when checkbox is clicked', async () => {
    const wrapper = mount(TableDemo)
    
    const readonlyControl = wrapper.find('.readonly-control')
    const checkbox = readonlyControl.find('input[type="checkbox"]')
    const virtualTable = wrapper.findComponent({ name: 'VirtualTable' })
    
    // Initially readonly
    expect(virtualTable.props('readonly')).toBe(true)
    
    // Uncheck the checkbox to toggle to editable mode
    await checkbox.setValue(false)
    
    // Should now be editable
    expect(virtualTable.props('readonly')).toBe(false)
    
    const status = wrapper.find('.status')
    expect(status.text()).toBe('EDITABLE')
    expect(status.classes()).not.toContain('active')
  })

  it('generates correct test data', () => {
    const wrapper = mount(TableDemo)
    const virtualTable = wrapper.findComponent({ name: 'VirtualTable' })
    const data = virtualTable.props('data')
    
    // Check first item
    expect(data[0]).toEqual({
      ID: 1,
      Name: 'User 1',
      Email: 'user1@test.com'
    })
    
    // Check last item
    expect(data[999]).toEqual({
      ID: 1000,
      Name: 'User 1000',
      Email: 'user1000@test.com'
    })
  })

  it('has correct column structure', () => {
    const wrapper = mount(TableDemo)
    const virtualTable = wrapper.findComponent({ name: 'VirtualTable' })
    const columns = virtualTable.props('columns')
    
    expect(columns).toContain('ID')
    expect(columns).toContain('Name')
    expect(columns).toContain('Email')
  })

  it('can toggle theme mode', async () => {
    const wrapper = mount(TableDemo)
    const themeSwitch = wrapper.find('#theme-switch')
    const virtualTable = wrapper.findComponent({ name: 'VirtualTable' })
    
    // Initially light theme
    expect(virtualTable.props('darkTheme')).toBe(false)
    
    // Toggle to dark theme
    await themeSwitch.setValue(true)
    expect(virtualTable.props('darkTheme')).toBe(true)
  })

  it('shows correct theme status', async () => {
    const wrapper = mount(TableDemo)
    const themeText = wrapper.find('.theme-text')
    
    // Initially shows Light
    expect(themeText.text()).toBe('Light')
    
    // Toggle theme switch
    const themeSwitch = wrapper.find('#theme-switch')
    await themeSwitch.setValue(true)
    await wrapper.vm.$nextTick()
    
    // Should show Dark
    expect(themeText.text()).toBe('Dark')
  })

  it('has theme toggle in top right corner', () => {
    const wrapper = mount(TableDemo)
    const themeToggleCorner = wrapper.find('.theme-toggle-corner')
    
    expect(themeToggleCorner.exists()).toBe(true)
    expect(themeToggleCorner.find('.theme-toggle').exists()).toBe(true)
    expect(themeToggleCorner.find('#theme-switch').exists()).toBe(true)
  })
})
